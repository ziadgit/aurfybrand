import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Check,
  ChevronRight,
  CloudOff,
  Download,
  Info,
  Menu,
  MonitorSmartphone,
  Megaphone,
  Radar,
  RotateCcw,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { useStudio } from "@/aurfy/store";
import { useOnline } from "@/aurfy/use-online";
import { useInstallPrompt } from "@/aurfy/use-install-prompt";
import { workflowProgress } from "@/aurfy/progress";
import { STAGES } from "@/aurfy/content";
import { merchantSourceMeta } from "@/aurfy/utils";
import { cn } from "@/lib/utils";
import { BrandLockup, BrandMark } from "./brand";
import { MOBILE_NAV, WORKFLOW, stepForPath } from "./nav";
import { MerchantSwitcher } from "./merchant-switcher";
import { Pill } from "./ui-bits";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function PersistenceBadge({ compact = false }: { compact?: boolean }) {
  const { persistence, state, storageError } = useStudio();
  const savedTime = new Date(state.updatedAt);
  const label =
    persistence === "saving"
      ? "Saving…"
      : persistence === "error"
        ? "Not saved"
        : persistence === "unavailable"
          ? "Session only"
          : "Saved on device";
  const tone = persistence === "error" ? "text-destructive" : persistence === "saving" ? "text-muted-foreground" : "text-success";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label={`${label}. View how this prototype stores data.`}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", persistence === "error" ? "bg-destructive" : "bg-success")} />
          {!compact ? <span className={tone}>{label}</span> : <span className="sr-only">{label}</span>}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Where your work is stored</DialogTitle>
          <DialogDescription>Local browser persistence, no account, no cloud sync.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            This prototype saves merchants, signals, briefs, concepts, drafts and pipeline notes in this browser&apos;s{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">localStorage</code>. Nothing is uploaded, and
            nothing syncs between devices or browsers.
          </p>
          <p>
            Clearing site data, using private browsing, or switching browsers starts over from the fictional demo dataset. There
            is no server backup and no multi-user collaboration.
          </p>
          {storageError ? (
            <p className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-destructive">{storageError}</p>
          ) : (
            <p className="rounded-xl border border-border bg-muted/40 p-3 text-xs">
              Last local write:{" "}
              <span className="font-medium text-foreground">
                {Number.isNaN(savedTime.getTime()) ? "unknown" : savedTime.toLocaleString()}
              </span>
            </p>
          )}
          <p className="text-xs">
            The app shell can be cached for offline use. Signal data is bundled demo content or text you pasted — it is never
            refreshed from the web.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InstallDialog() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [busy, setBusy] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-left text-[12px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {installed ? "Installed as an app" : "Install app shell"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install Aurfy Signal Studio</DialogTitle>
          <DialogDescription>A cached app shell opens offline. Your saved work stays local either way.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            On an Android or desktop browser, use the install action below or choose <strong>Install app</strong> from the browser
            menu. On iPhone or iPad, open the Share menu and choose <strong>Add to Home Screen</strong> — Safari does not offer
            an in-page install prompt.
          </p>
          {installed ? (
            <p className="rounded-xl border border-success/25 bg-success-soft/60 p-3 text-success">
              Already running as an installed app.
            </p>
          ) : (
            <Button
              className="w-full"
              disabled={!canInstall || busy}
              onClick={async () => {
                setBusy(true);
                const result = await promptInstall();
                setBusy(false);
                if (result === "unavailable") {
                  toast.info("In-page install unavailable", {
                    description: "Use your browser menu, or Share → Add to Home Screen on iOS.",
                  });
                }
              }}
            >
              <Download className="h-4 w-4" />
              {canInstall ? "Install now" : "Install prompt not available in this browser"}
            </Button>
          )}
          <p className="text-xs">
            Install prompts require a supported browser and HTTPS. In this preview frame the prompt may be suppressed; the
            manifest and service worker are still shipped.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResetDemo() {
  const { resetDemo, persistence } = useStudio();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-left text-[12px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset demo data
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset to the fictional demo?</AlertDialogTitle>
          <AlertDialogDescription>
            This replaces every record on this device — including merchants you added manually, their signals, briefs, concepts,
            drafts and pipeline notes — with the seeded demo workspace. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my work</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              resetDemo();
              toast.success("Demo workspace restored", {
                description:
                  persistence === "error" ? "Browser storage is unavailable, so this reset lasts until reload." : "All records are fictional.",
              });
            }}
          >
            Reset demo data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StepList({ onNavigate }: { onNavigate?: () => void }) {
  const studio = useStudio();
  const location = useLocation();
  const done = workflowProgress(studio);

  return (
    <ol className="space-y-1">
      {WORKFLOW.map((item) => {
        const active = location.pathname === item.path || (item.path === "/signals" && location.pathname.startsWith("/signals"));
        const Icon = item.icon;
        return (
          <li key={item.path}>
            <NavLink
              to={item.path}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-xl px-2.5 py-2 transition",
                active ? "bg-primary-soft text-primary" : "text-ink-soft hover:bg-secondary/80 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  active ? "border-primary/30 bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                )}
              >
                {done[item.step ?? 0] ? <Check className="h-3.5 w-3.5" aria-label="Step complete" /> : item.step}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
                  <span className="truncate text-[13px] font-semibold">{item.short === "Angle" ? "Positioning" : item.label}</span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{item.description}</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
            </NavLink>
          </li>
        );
      })}
    </ol>
  );
}

export function AppShell() {
  const { merchant, pipeline, persistence } = useStudio();
  const { pathname } = useLocation();
  const online = useOnline();
  const [menuOpen, setMenuOpen] = useState(false);
  const step = stepForPath(pathname);
  const isMore = pathname === "/more";
  const isProspects = pathname === "/prospects";
  const isSocial = pathname === "/social";
  const stage = STAGES.find((item) => item.id === pipeline.stage);
  const merchantSource = merchantSourceMeta(merchant);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = isSocial
      ? "Social · Aurfy Signal Studio"
      : isProspects
      ? "Prospect engine · Aurfy Signal Studio"
      : isMore
        ? "More · Aurfy Signal Studio"
        : step
          ? `${step.label} · Aurfy Signal Studio`
          : "Aurfy Signal Studio";
  }, [step, isMore, isProspects, isSocial]);

  return (
    <div className="aurfy-shell min-h-[100dvh]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="lg:flex">
        {/* Desktop rail */}
        <aside className="sticky top-0 hidden h-[100dvh] w-[284px] shrink-0 flex-col border-r border-border/70 bg-background/80 px-5 py-6 backdrop-blur lg:flex">
          <Link to="/" className="inline-flex rounded-xl" aria-label="Aurfy Signal Studio home">
            <BrandLockup />
          </Link>
          <div className="mt-6 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <p className="font-mono-label mb-2 text-[9px] text-muted-foreground">Working on</p>
            <MerchantSwitcher />
            <div className="mt-2 flex items-center justify-between gap-2">
              <Pill tone={merchantSource.tone}>{merchantSource.label}</Pill>
              <Pill tone="neutral">{stage?.short}</Pill>
            </div>
            <PersistenceBadge />
          </div>

          <NavLink
            to="/more"
            end
            className={({ isActive }) =>
              cn(
                "mt-4 flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-[12px] font-semibold transition",
                isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <Info className="h-4 w-4" aria-hidden="true" />
            Studio overview
          </NavLink>
          <NavLink
            to="/prospects"
            className={({ isActive }) =>
              cn(
                "mt-1 flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-[12px] font-semibold transition",
                isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <Radar className="h-4 w-4" aria-hidden="true" />
            Prospect engine
          </NavLink>
          <NavLink
            to="/social"
            className={({ isActive }) =>
              cn(
                "mt-1 flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-[12px] font-semibold transition",
                isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <Megaphone className="h-4 w-4" aria-hidden="true" />
            Social · LinkedIn & X
          </NavLink>

          <nav className="mt-2 min-h-0 flex-1 overflow-y-auto" aria-label="Workflow steps">
            <p className="font-mono-label mb-2 px-2.5 text-[9px] text-muted-foreground">The bounded workflow</p>
            <StepList />
          </nav>

          <div className="mt-4 border-t border-border pt-3">
            <div
              className={cn(
                "mb-2 flex items-center gap-2 rounded-xl px-2 py-1.5 text-[11px] font-medium",
                online ? "text-success" : "text-warning",
              )}
            >
              {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {online ? "Online · no live signals configured" : "Offline · saved work only"}
            </div>
            <InstallDialog />
            <ResetDemo />
            <p className="mt-2 px-2 text-[10px] leading-relaxed text-muted-foreground">
              Hackathon prototype. Demo data is fictional. No sending, posting or partnership is implied.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <header className="safe-top sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur lg:hidden">
            <div className="flex h-14 items-center gap-2 px-3">
              <Link to="/" className="rounded-lg" aria-label="Aurfy Signal Studio home">
                <span className="flex items-center gap-2">
                  <BrandMark className="h-8 w-8" />
                  <span className="text-[15px] font-bold tracking-tight">Aurfy</span>
                </span>
              </Link>
              <span className="mx-auto">
                <MerchantSwitcher compact />
              </span>
              <PersistenceBadge compact />
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
                    aria-label="Open menu and all steps"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto">
                  <SheetHeader className="text-left">
                    <SheetTitle className="flex items-center gap-2">
                      <BrandMark className="h-8 w-8" /> All steps
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4 pb-8">
                    <div className="grid grid-cols-4 gap-2">
                      <NavLink
                        to="/more"
                        end
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 text-[10px] font-semibold text-foreground"
                      >
                        <Info className="h-4 w-4" aria-hidden="true" />
                        Overview
                      </NavLink>
                      <NavLink
                        to="/prospects"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 text-[10px] font-semibold text-foreground"
                      >
                        <Radar className="h-4 w-4" aria-hidden="true" />
                        Prospects
                      </NavLink>
                      <NavLink
                        to="/social"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 text-[10px] font-semibold text-foreground"
                      >
                        <Megaphone className="h-4 w-4" aria-hidden="true" />
                        Social
                      </NavLink>
                      <NavLink
                        to="/deck"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 text-[10px] font-semibold text-foreground"
                      >
                        <BrandMark className="h-4 w-4" />
                        Deck
                      </NavLink>
                    </div>
                    <StepList onNavigate={() => setMenuOpen(false)} />
                    <div className="rounded-2xl border border-border bg-card p-3">
                      <p className="font-mono-label mb-2 text-[9px] text-muted-foreground">Data & app</p>
                      <InstallDialog />
                      <ResetDemo />
                      <PersistenceBadge />
                    </div>
                    <div className="flex items-start gap-2 rounded-2xl border border-warning/25 bg-warning-soft/60 p-3 text-[11px] leading-relaxed text-warning">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Demo data is fictional. This app never sends messages or posts socially, and never asserts a real
                      partnership.
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {!online ? (
              <div className="flex items-center gap-2 border-t border-warning/25 bg-warning-soft px-3 py-2 text-[11px] font-medium text-warning" role="status">
                <CloudOff className="h-3.5 w-3.5" />
                Offline — showing cached shell and this device&apos;s saved work. No new signals, AI drafts or generated visuals.
              </div>
            ) : null}
          </header>

          {/* Desktop top bar */}
          <div className="sticky top-0 z-30 hidden border-b border-border/60 bg-background/80 backdrop-blur lg:block">
            <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-8">
              <span className="font-mono-label text-[10px] text-muted-foreground">
                {isSocial ? "Audience growth" : isProspects ? "Public snapshot + Clay simulation" : isMore ? "Learn more" : step ? `Step ${step.step} of 7` : "Studio overview"}
              </span>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-foreground">
                {isSocial ? "Social · LinkedIn & X" : isProspects ? "Prospect engine" : isMore ? "More" : step?.label ?? "Signal Studio"}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                    online ? "border-success/20 bg-success-soft text-success" : "border-warning/25 bg-warning-soft text-warning",
                  )}
                >
                  {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {online ? "No live research connected" : "Offline"}
                </span>
                <PersistenceBadge />
              </div>
            </div>
          </div>

          <main id="main" className="mx-auto w-full max-w-[1180px] px-4 pb-32 pt-5 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
            {!online ? (
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning-soft p-3 text-[12px] leading-relaxed text-warning lg:hidden">
                <CloudOff className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  You&apos;re offline. Saved work and the app shell remain available. Signals are not refreshed and AI drafting or
                  image generation is unavailable until you reconnect.
                </span>
              </div>
            ) : null}

            <Outlet />

            <footer className="mt-10 border-t border-border/70 pt-5 text-[11px] leading-relaxed text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-soft">
                  <BrandMark className="h-5 w-5" />
                  Aurfy Signal Studio
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5" /> Mobile-first PWA prototype
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MonitorSmartphone className="h-3.5 w-3.5" /> No auto-send or social posting
                </span>
              </div>
              <p className="mt-2 max-w-3xl">
                Hackathon prototype for the Converge.AI challenge. Demo merchants and signals are fictional and labeled. Aurfy
                capability statements are limited to the challenge brief. Nothing here implies a partnership, a measured business
                outcome, or verified social feed access.
              </p>
              <p className="mt-2">
                Persistence: this browser only ({persistence === "error" ? "currently failing" : "localStorage"}). No live web
                research integration is configured.
              </p>
            </footer>
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 px-1 pt-1.5 shadow-float backdrop-blur lg:hidden"
        aria-label="Studio sections"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.path);
            return (
              <li key={item.path} className="min-w-0">
                <NavLink
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1.5 text-[9.5px] font-semibold transition",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-9 items-center justify-center rounded-full transition",
                      active ? "bg-primary-soft" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
                  </span>
                  <span className="truncate">{item.short}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
