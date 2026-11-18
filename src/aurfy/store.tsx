import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createDemoWorkspace,
  defaultCapabilities,
  defaultPipeline,
  emptyBrief,
  emptyConcept,
  emptyOutreach,
  emptyPositioning,
  freshSignals,
} from "./demo";
import type {
  Brief,
  Capability,
  ConceptDraft,
  Merchant,
  OutreachDraft,
  PipelineEntry,
  Positioning,
  Signal,
  SignalCategory,
  SignalStatus,
  StageId,
  WorkspaceState,
} from "./types";

const STORAGE_KEY = "aurfy.signal.studio.v1";

export type PersistenceState = "saved" | "saving" | "error" | "unavailable";

type NewMerchantInput = { name: string; url: string; category: string; notes: string };

type QueueCoBrandInput = {
  merchantId?: string;
  logoUrl?: string | null;
  name: string;
  url: string;
  category: string;
  notes: string;
  recordSource: MerchantSource;
  isDemo: boolean;
  signalTitle: string;
  signals: Omit<Signal, "id" | "status" | "addedAt">[];
};

type SourcedMerchantInput = {
  name: string;
  logoUrl?: string | null;
  url: string;
  category: string;
  notes: string;
  recordSource: "public" | "clay_simulated";
  signals: Omit<Signal, "id" | "status" | "addedAt">[];
};

const normalizeMerchantUrl = (url: string) =>
  url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");

type SignalInput = {
  category: SignalCategory;
  title: string;
  sourceName: string;
  sourceUrl: string;
  sourceDate: string;
  text: string;
};

type StudioContextValue = {
  state: WorkspaceState;
  merchant: Merchant;
  signals: Signal[];
  brief: Brief;
  positioning: Positioning;
  concept: ConceptDraft;
  outreach: OutreachDraft;
  pipeline: PipelineEntry;
  persistence: PersistenceState;
  storageError: string | null;
  setActiveMerchant: (id: string) => void;
  addMerchant: (input: NewMerchantInput) => Merchant;
  addSourcedMerchant: (input: SourcedMerchantInput) => { merchantId: string; created: boolean; signalCount: number };
  addSignalsToMerchant: (merchantId: string, signals: Omit<Signal, "id" | "status" | "addedAt">[]) => number;
  queueCoBrand: (input: QueueCoBrandInput) => { merchantId: string; created: boolean; queued: boolean };
  dequeueCoBrand: (merchantId: string) => void;
  updateMerchant: (patch: Partial<Pick<Merchant, "name" | "url" | "category" | "notes">>) => void;
  deleteMerchant: (id: string) => void;
  setSignalStatus: (signalId: string, status: SignalStatus) => void;
  addPastedSignal: (input: SignalInput) => Signal;
  loadDemoSignals: () => number;
  updateBrief: (patch: Partial<Brief>) => void;
  setAngle: (angle: Positioning["angle"]) => void;
  toggleCapability: (capabilityId: string) => void;
  updateCapability: (capabilityId: string, statement: string) => void;
  setPositioningReviewed: (reviewed: boolean) => void;
  updateConcept: (patch: Partial<ConceptDraft>) => void;
  updateOutreach: (patch: Partial<OutreachDraft>) => void;
  updatePipeline: (patch: Partial<PipelineEntry>) => void;
  setStage: (stage: StageId) => void;
  resetDemo: () => void;
  capabilityById: (id: string | null) => Capability | undefined;
  signalById: (id: string | null) => Signal | undefined;
  selectedSignals: Signal[];
};

const StudioContext = createContext<StudioContextValue | null>(null);

function isWorkspace(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as WorkspaceState;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.merchants) &&
    candidate.merchants.length > 0 &&
    !!candidate.signalsByMerchant &&
    !!candidate.briefs &&
    !!candidate.positioning &&
    !!candidate.concepts &&
    !!candidate.outreach &&
    !!candidate.pipeline
  );
}

const DEMO_EXAMPLE_IDS = ["marlow-fen", "halcyon-swim", "fernway-grocers"];

/**
 * Additive one-time scaffolding for the showcase examples. It only touches the
 * known demo merchants and only fills concept/positioning data that is still
 * empty, so manual merchants and real edits are preserved.
 */
function backfillDemoExamples(stored: WorkspaceState): WorkspaceState {
  const seeded = createDemoWorkspace();
  const concepts = { ...stored.concepts };
  const positioning = { ...stored.positioning };
  const signalsByMerchant = { ...stored.signalsByMerchant };
  let changed = false;

  for (const id of DEMO_EXAMPLE_IDS) {
    const merchant = stored.merchants.find((item) => item.id === id);
    if (!merchant?.isDemo) continue;
    const concept = stored.concepts[id];
    const position = stored.positioning[id];
    const seededConcept = seeded.concepts[id];
    const seededPositioning = seeded.positioning[id];
    if (!seededConcept || !seededPositioning) continue;

    const emptyConcept = !concept || (!concept.headline?.trim() && !concept.imageUrl);
    const emptyPositioning = !position || (!position.angle && (position.capabilityIds?.length ?? 0) === 0);
    if (emptyConcept && emptyPositioning) {
      concepts[id] = seededConcept;
      positioning[id] = seededPositioning;
      const existingSignals = stored.signalsByMerchant[id] ?? [];
      const untouched = existingSignals.every((signal) => signal.status === "new");
      if (untouched) signalsByMerchant[id] = seeded.signalsByMerchant[id] ?? existingSignals;
      changed = true;
      continue;
    }

    if (concept) {
      const artPatch: Partial<typeof concept> = {};
      if (concept.layout === undefined) artPatch.layout = seededConcept.layout;
      if (concept.displayFont === undefined) artPatch.displayFont = seededConcept.displayFont;
      if (
        seededConcept.logoDataUrl &&
        (concept.logoDataUrl === undefined || (concept.logoDataUrl === null && concept.reviewed))
      ) {
        artPatch.logoDataUrl = seededConcept.logoDataUrl;
      }
      // The old seed predates optional concept imagery. Add it only when the
      // field was never present; an explicit null (user removed it) is preserved.
      if (id === "marlow-fen" && concept.imageUrl === undefined && concept.headline === seededConcept.headline) {
        artPatch.imageUrl = seededConcept.imageUrl;
      }
      if (Object.keys(artPatch).length > 0) {
        concepts[id] = { ...concept, ...artPatch };
        changed = true;
      }
    }
  }

  return changed ? { ...stored, concepts, positioning, signalsByMerchant, updatedAt: new Date().toISOString() } : stored;
}

function loadWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return createDemoWorkspace();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDemoWorkspace();
    const parsed: unknown = JSON.parse(raw);
    if (!isWorkspace(parsed)) return createDemoWorkspace();
    if (!parsed.merchants.some((merchant) => merchant.id === parsed.activeMerchantId)) {
      parsed.activeMerchantId = parsed.merchants[0].id;
    }
    return backfillDemoExamples(parsed);
  } catch {
    return createDemoWorkspace();
  }
}

function touch(state: WorkspaceState): WorkspaceState {
  return { ...state, updatedAt: new Date().toISOString() };
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(loadWorkspace);
  const [persistence, setPersistence] = useState<PersistenceState>("saved");
  const [storageError, setStorageError] = useState<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPersistence("saving");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setPersistence("saved");
        setStorageError(null);
      } catch (error) {
        setPersistence("error");
        setStorageError(
          error instanceof Error && error.name === "QuotaExceededError"
            ? "Browser storage is full, so the latest edits may not survive a reload. Remove the uploaded logo or reset demo data."
            : "This browser blocked local storage, so changes exist only until you close the tab.",
        );
      }
    }, 220);
    return () => window.clearTimeout(saveTimer.current);
  }, [state]);

  const merchant = useMemo(() => {
    return state.merchants.find((item) => item.id === state.activeMerchantId) ?? state.merchants[0];
  }, [state.merchants, state.activeMerchantId]);

  const safeSignals = useMemo(() => state.signalsByMerchant[merchant.id] ?? [], [state.signalsByMerchant, merchant.id]);
  const brief = state.briefs[merchant.id] ?? emptyBrief();
  const positioning = state.positioning[merchant.id] ?? emptyPositioning();
  const concept = state.concepts[merchant.id] ?? emptyConcept(merchant.name);
  const outreach = state.outreach[merchant.id] ?? emptyOutreach();
  const pipeline = state.pipeline[merchant.id] ?? defaultPipeline();

  const updateSignal = useCallback(
    (signalId: string, update: (signal: Signal) => Signal) => {
      setState((current) => {
        const merchantId = current.activeMerchantId;
        const existing = current.signalsByMerchant[merchantId] ?? [];
        return touch({
          ...current,
          signalsByMerchant: {
            ...current.signalsByMerchant,
            [merchantId]: existing.map((signal) => (signal.id === signalId ? update(signal) : signal)),
          },
        });
      });
    },
    [],
  );

  const setSignalStatus = useCallback(
    (signalId: string, status: SignalStatus) => updateSignal(signalId, (signal) => ({ ...signal, status })),
    [updateSignal],
  );

  const setActiveMerchant = useCallback(
    (id: string) => setState((current) => touch({ ...current, activeMerchantId: id })),
    [],
  );

  const addMerchant = useCallback((input: NewMerchantInput) => {
    const id = `m_${Date.now().toString(36)}`;
    const newMerchant: Merchant = {
      id,
      name: input.name.trim(),
      url: input.url.trim(),
      category: input.category.trim(),
      notes: input.notes.trim(),
      isDemo: false,
      recordSource: "manual",
      createdAt: new Date().toISOString(),
    };
    setState((current) =>
      touch({
        ...current,
        merchants: [...current.merchants, newMerchant],
        activeMerchantId: id,
        signalsByMerchant: { ...current.signalsByMerchant, [id]: [] },
        briefs: { ...current.briefs, [id]: emptyBrief() },
        positioning: { ...current.positioning, [id]: emptyPositioning() },
        concepts: { ...current.concepts, [id]: emptyConcept(newMerchant.name) },
        outreach: { ...current.outreach, [id]: emptyOutreach() },
        pipeline: { ...current.pipeline, [id]: defaultPipeline() },
      }),
    );
    return newMerchant;
  }, []);

  const addSourcedMerchant = useCallback(
    (input: SourcedMerchantInput) => {
      const existing = state.merchants.find(
        (merchant) =>
          (merchant.url && normalizeMerchantUrl(merchant.url) === normalizeMerchantUrl(input.url)) ||
          merchant.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
      );
      if (existing) {
        setState((current) => touch({ ...current, activeMerchantId: existing.id }));
        return {
          merchantId: existing.id,
          created: false,
          signalCount: state.signalsByMerchant[existing.id]?.length ?? 0,
        };
      }

      const merchantId = `src_${Date.now().toString(36)}`;
      const createdAt = new Date().toISOString();
      const merchant: Merchant = {
        id: merchantId,
        name: input.name.trim(),
        url: input.url.trim(),
        category: input.category.trim(),
        notes: input.notes.trim(),
        isDemo: false,
        recordSource: input.recordSource,
        createdAt,
      };
      const signals = input.signals.map((signal, index) => ({
        ...signal,
        id: `sg_${merchantId}_${String(index + 1).padStart(2, "0")}`,
        status: "new" as SignalStatus,
        addedAt: createdAt,
      }));
      const due = new Date();
      due.setDate(due.getDate() + 2);
      const pipeline = {
        ...defaultPipeline(),
        nextAction: "Review the imported signals and select a balanced customer + peer set",
        dueDate: due.toISOString().slice(0, 10),
        notes: `Created from the prospect engine on ${new Date().toLocaleDateString("en-GB")}. Review every imported source before using it.`,
        updatedAt: createdAt,
      };

      setState((current) => {
        if (
          current.merchants.some(
            (item) =>
              (item.url && normalizeMerchantUrl(item.url) === normalizeMerchantUrl(input.url)) ||
              item.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
          )
        ) {
          return current;
        }
        return touch({
          ...current,
          merchants: [...current.merchants, merchant],
          activeMerchantId: merchantId,
          signalsByMerchant: { ...current.signalsByMerchant, [merchantId]: signals },
          briefs: { ...current.briefs, [merchantId]: emptyBrief() },
          positioning: { ...current.positioning, [merchantId]: emptyPositioning() },
          concepts: {
            ...current.concepts,
            [merchantId]: { ...emptyConcept(merchant.name), logoDataUrl: input.logoUrl ?? null },
          },
          outreach: { ...current.outreach, [merchantId]: emptyOutreach() },
          pipeline: { ...current.pipeline, [merchantId]: pipeline },
        });
      });

      return { merchantId, created: true, signalCount: signals.length };
    },
    [state],
  );

  const addSignalsToMerchant = useCallback(
    (merchantId: string, signals: Omit<Signal, "id" | "status" | "addedAt">[]) => {
      const existing = state.signalsByMerchant[merchantId] ?? [];
      const known = new Set(existing.map((signal) => `${signal.sourceUrl}|${signal.title}`));
      const toAdd = signals.filter((signal) => !known.has(`${signal.sourceUrl}|${signal.title}`));
      if (toAdd.length === 0) return 0;

      const addedAt = new Date().toISOString();
      const prepared = toAdd.map((signal, index) => ({
        ...signal,
        id: `sg_${merchantId}_live_${Date.now().toString(36)}_${index}`,
        status: "new" as SignalStatus,
        addedAt,
      }));

      setState((current) => {
        const currentSignals = current.signalsByMerchant[merchantId] ?? [];
        const currentKnown = new Set(currentSignals.map((signal) => `${signal.sourceUrl}|${signal.title}`));
        const additions = prepared.filter((signal) => !currentKnown.has(`${signal.sourceUrl}|${signal.title}`));
        if (additions.length === 0) return current;
        return touch({
          ...current,
          signalsByMerchant: {
            ...current.signalsByMerchant,
            [merchantId]: [...additions, ...currentSignals],
          },
        });
      });

      return prepared.length;
    },
    [state],
  );

  const queueCoBrand = useCallback(
    (input: QueueCoBrandInput) => {
      const now = new Date().toISOString();
      const existing = input.merchantId
        ? state.merchants.find((merchant) => merchant.id === input.merchantId)
        : state.merchants.find(
            (merchant) =>
              (merchant.url && normalizeMerchantUrl(merchant.url) === normalizeMerchantUrl(input.url)) ||
              merchant.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
          );

      if (existing) {
        const targetId = existing.id;
        const existingSignals = state.signalsByMerchant[targetId] ?? [];
        const seed = input.signals.find((signal) => signal.title === input.signalTitle);
        const prepared = existingSignals.map((signal) =>
          signal.title === input.signalTitle ? { ...signal, status: "selected" as SignalStatus } : signal,
        );
        const signalsToUse =
          seed && !existingSignals.some((signal) => signal.title === input.signalTitle)
            ? [
                {
                  ...seed,
                  id: `sg_${targetId}_queued_${Date.now().toString(36)}`,
                  status: "selected" as SignalStatus,
                  addedAt: now,
                },
                ...prepared,
              ]
            : prepared;

        setState((current) => {
          const base = current.pipeline[targetId] ?? defaultPipeline();
          const concept = current.concepts[targetId];
          const concepts =
            input.logoUrl && concept && !concept.logoDataUrl
              ? { ...current.concepts, [targetId]: { ...concept, logoDataUrl: input.logoUrl } }
              : current.concepts;
          return touch({
            ...current,
            activeMerchantId: targetId,
            concepts,
            signalsByMerchant: { ...current.signalsByMerchant, [targetId]: signalsToUse },
            pipeline: {
              ...current.pipeline,
              [targetId]: {
                ...base,
                queuedAt: now,
                queuedSignal: input.signalTitle,
                nextAction: `Co-brand queued from: ${input.signalTitle}`,
                notes: base.notes,
                updatedAt: now,
              },
            },
          });
        });
        return { merchantId: targetId, created: false, queued: true };
      }

      const merchantId = `src_${Date.now().toString(36)}`;
      const merchant: Merchant = {
        id: merchantId,
        name: input.name.trim(),
        url: input.url.trim(),
        category: input.category.trim(),
        notes: input.notes.trim(),
        isDemo: false,
        recordSource: input.recordSource,
        createdAt: now,
      };
      const signals = input.signals.map((signal, index) => ({
        ...signal,
        id: `sg_${merchantId}_${String(index + 1).padStart(2, "0")}`,
        status: (signal.title === input.signalTitle ? "selected" : "new") as SignalStatus,
        addedAt: now,
      }));
      const pipeline = {
        ...defaultPipeline(),
        stage: "research" as StageId,
        queuedAt: now,
        queuedSignal: input.signalTitle,
        nextAction: `Co-brand queued from: ${input.signalTitle}`,
        notes: input.notes,
        updatedAt: now,
      };

      setState((current) => {
        const already = current.merchants.find(
          (item) =>
            (item.url && normalizeMerchantUrl(item.url) === normalizeMerchantUrl(input.url)) ||
            item.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
        );
        if (already) {
          const base = current.pipeline[already.id] ?? defaultPipeline();
          const existingSignals = current.signalsByMerchant[already.id] ?? [];
          const selected = existingSignals.map((signal) =>
            signal.title === input.signalTitle ? { ...signal, status: "selected" as SignalStatus } : signal,
          );
          return touch({
            ...current,
            activeMerchantId: already.id,
            signalsByMerchant: { ...current.signalsByMerchant, [already.id]: selected },
            pipeline: {
              ...current.pipeline,
              [already.id]: {
                ...base,
                queuedAt: now,
                queuedSignal: input.signalTitle,
                nextAction: `Co-brand queued from: ${input.signalTitle}`,
                updatedAt: now,
              },
            },
          });
        }
        return touch({
          ...current,
          merchants: [...current.merchants, merchant],
          activeMerchantId: merchantId,
          signalsByMerchant: { ...current.signalsByMerchant, [merchantId]: signals },
          briefs: { ...current.briefs, [merchantId]: emptyBrief() },
          positioning: { ...current.positioning, [merchantId]: emptyPositioning() },
          concepts: {
            ...current.concepts,
            [merchantId]: { ...emptyConcept(merchant.name), logoDataUrl: input.logoUrl ?? null },
          },
          outreach: { ...current.outreach, [merchantId]: emptyOutreach() },
          pipeline: { ...current.pipeline, [merchantId]: pipeline },
        });
      });

      return { merchantId, created: true, queued: true };
    },
    [state],
  );

  const dequeueCoBrand = useCallback((merchantId: string) => {
    setState((current) => {
      const base = current.pipeline[merchantId];
      if (!base) return current;
      return touch({
        ...current,
        pipeline: {
          ...current.pipeline,
          [merchantId]: {
            ...base,
            queuedAt: undefined,
            queuedSignal: undefined,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    });
  }, []);

  const updateMerchant = useCallback((patch: Partial<Pick<Merchant, "name" | "url" | "category" | "notes">>) => {
    setState((current) => {
      const id = current.activeMerchantId;
      const merchants = current.merchants.map((item) =>
        item.id === id ? { ...item, ...patch, name: (patch.name ?? item.name).trim() || item.name } : item,
      );
      const changedName = patch.name?.trim();
      const concept = changedName
        ? {
            ...current.concepts,
            [id]: { ...current.concepts[id], merchantDisplayName: current.concepts[id]?.merchantDisplayName || changedName },
          }
        : current.concepts;
      return touch({ ...current, merchants, concepts: concept });
    });
  }, []);

  const deleteMerchant = useCallback((id: string) => {
    setState((current) => {
      if (current.merchants.length <= 1) return current;
      const merchants = current.merchants.filter((item) => item.id !== id);
      const nextId = current.activeMerchantId === id ? merchants[0].id : current.activeMerchantId;
      const drop = <T,>(record: Record<string, T>) => {
        const next = { ...record };
        delete next[id];
        return next;
      };
      return touch({
        ...current,
        merchants,
        activeMerchantId: nextId,
        signalsByMerchant: drop(current.signalsByMerchant),
        briefs: drop(current.briefs),
        positioning: drop(current.positioning),
        concepts: drop(current.concepts),
        outreach: drop(current.outreach),
        pipeline: drop(current.pipeline),
      });
    });
  }, []);

  const addPastedSignal = useCallback(
    (input: SignalInput) => {
      const id = `u_${Date.now().toString(36)}`;
      const signal: Signal = {
        id,
        category: input.category,
        title: input.title.trim() || "User-supplied signal",
        sourceName: input.sourceName.trim() || "Pasted by you",
        sourceUrl: input.sourceUrl.trim(),
        sourceDate: input.sourceDate || null,
        retrievedAt: null,
        provenance: "user",
        evidence: input.text.trim().slice(0, 4000),
        whyItMatters:
          "Inference to test: this user-supplied observation may point at a payment or checkout expectation worth asking about. No automated analysis was applied.",
        novelty: "Not assessed. This signal was added by you in this session.",
        limitations:
          "User-supplied text. Not independently verified, not fetched by Aurfy, and no engagement or volume data is implied.",
        confidence: "low",
        question:
          input.category === "customer"
            ? "How often does this behaviour or request appear in your own customer conversations?"
            : "How, if at all, has this peer activity influenced your payment plans?",
        tags: ["user-supplied", input.category === "customer" ? "customer behaviour" : "peer"],
        status: "new",
        addedAt: new Date().toISOString(),
      };
      setState((current) => {
        const merchantId = current.activeMerchantId;
        const existing = current.signalsByMerchant[merchantId] ?? [];
        return touch({
          ...current,
          signalsByMerchant: { ...current.signalsByMerchant, [merchantId]: [signal, ...existing] },
        });
      });
      return signal;
    },
    [],
  );

  const loadDemoSignals = useCallback(() => {
    const merchantId = state.activeMerchantId;
    const existing = state.signalsByMerchant[merchantId] ?? [];
    const existingIds = new Set(existing.map((signal) => signal.id));
    const toAdd = freshSignals(merchantId).filter((signal) => !existingIds.has(signal.id));
    setState((current) => {
      const currentExisting = current.signalsByMerchant[merchantId] ?? [];
      const currentIds = new Set(currentExisting.map((signal) => signal.id));
      const additions = toAdd.filter((signal) => !currentIds.has(signal.id));
      return touch({
        ...current,
        signalsByMerchant: {
          ...current.signalsByMerchant,
          [merchantId]: [...additions, ...currentExisting],
        },
      });
    });
    return toAdd.length;
  }, [state]);

  const updateBrief = useCallback((patch: Partial<Brief>) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.briefs[merchantId] ?? emptyBrief();
      return touch({
        ...current,
        briefs: {
          ...current.briefs,
          [merchantId]: {
            ...existing,
            ...patch,
            reviewed: patch.reviewed !== undefined ? patch.reviewed : false,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    });
  }, []);

  const setAngle = useCallback((angle: Positioning["angle"]) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.positioning[merchantId] ?? emptyPositioning();
      return touch({
        ...current,
        positioning: {
          ...current.positioning,
          [merchantId]: { ...existing, angle, reviewed: false, updatedAt: new Date().toISOString() },
        },
      });
    });
  }, []);

  const toggleCapability = useCallback((capabilityId: string) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.positioning[merchantId] ?? emptyPositioning();
      const isOn = existing.capabilityIds.includes(capabilityId);
      // Keep maximum two capabilities so the concept and note stay focused.
      const capabilityIds = isOn ? existing.capabilityIds.filter((id) => id !== capabilityId) : [...existing.capabilityIds, capabilityId];
      return touch({
        ...current,
        positioning: {
          ...current.positioning,
          [merchantId]: {
            ...existing,
            capabilityIds: capabilityIds.slice(0, 2),
            reviewed: false,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    });
  }, []);

  const updateCapability = useCallback((capabilityId: string, statement: string) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.positioning[merchantId] ?? emptyPositioning();
      return touch({
        ...current,
        positioning: {
          ...current.positioning,
          [merchantId]: {
            ...existing,
            capabilities: existing.capabilities.map((capability) =>
              capability.id === capabilityId
                ? { ...capability, statement, edited: statement !== defaultCapabilities().find((item) => item.id === capabilityId)?.statement }
                : capability,
            ),
            reviewed: false,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    });
  }, []);

  const setPositioningReviewed = useCallback((reviewed: boolean) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.positioning[merchantId] ?? emptyPositioning();
      return touch({
        ...current,
        positioning: { ...current.positioning, [merchantId]: { ...existing, reviewed, updatedAt: new Date().toISOString() } },
      });
    });
  }, []);

  const updateConcept = useCallback((patch: Partial<ConceptDraft>) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.concepts[merchantId] ?? emptyConcept(current.merchants.find((m) => m.id === merchantId)?.name ?? "Merchant");
      return touch({
        ...current,
        concepts: {
          ...current.concepts,
          [merchantId]: {
            ...existing,
            ...patch,
            reviewed: patch.reviewed !== undefined ? patch.reviewed : false,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    });
  }, []);

  const updateOutreach = useCallback((patch: Partial<OutreachDraft>) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.outreach[merchantId] ?? emptyOutreach();
      return touch({
        ...current,
        outreach: {
          ...current.outreach,
          [merchantId]: {
            ...existing,
            ...patch,
            reviewed: patch.reviewed !== undefined ? patch.reviewed : false,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    });
  }, []);

  const updatePipeline = useCallback((patch: Partial<PipelineEntry>) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.pipeline[merchantId] ?? defaultPipeline();
      return touch({
        ...current,
        pipeline: {
          ...current.pipeline,
          [merchantId]: { ...existing, ...patch, updatedAt: new Date().toISOString() },
        },
      });
    });
  }, []);

  const setStage = useCallback((stage: StageId) => {
    setState((current) => {
      const merchantId = current.activeMerchantId;
      const existing = current.pipeline[merchantId] ?? defaultPipeline();
      if (existing.stage === stage) return current;
      return touch({
        ...current,
        pipeline: {
          ...current.pipeline,
          [merchantId]: {
            ...existing,
            stage,
            history: [...existing.history, { stage, at: new Date().toISOString() }],
            updatedAt: new Date().toISOString(),
          },
        },
      });
    });
  }, []);

  const resetDemo = useCallback(() => {
    const seeded = createDemoWorkspace();
    setState(seeded);
    setPersistence("saved");
    setStorageError(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch {
      setPersistence("error");
    }
  }, []);

  const capabilityById = useCallback(
    (id: string | null) => (id ? positioning.capabilities.find((capability) => capability.id === id) : undefined),
    [positioning.capabilities],
  );
  const signalById = useCallback(
    (id: string | null) => (id ? safeSignals.find((signal) => signal.id === id) : undefined),
    [safeSignals],
  );

  const selectedSignals = useMemo(() => safeSignals.filter((signal) => signal.status === "selected"), [safeSignals]);

  const value: StudioContextValue = {
    state,
    merchant,
    signals: safeSignals,
    brief,
    positioning,
    concept,
    outreach,
    pipeline,
    persistence,
    storageError,
    setActiveMerchant,
    addMerchant,
    addSourcedMerchant,
    addSignalsToMerchant,
    queueCoBrand,
    dequeueCoBrand,
    updateMerchant,
    deleteMerchant,
    setSignalStatus,
    addPastedSignal,
    loadDemoSignals,
    updateBrief,
    setAngle,
    toggleCapability,
    updateCapability,
    setPositioningReviewed,
    updateConcept,
    updateOutreach,
    updatePipeline,
    setStage,
    resetDemo,
    capabilityById,
    signalById,
    selectedSignals,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudio(): StudioContextValue {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside StudioProvider");
  return context;
}

