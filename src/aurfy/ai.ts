/**
 * Optional server-side drafting.
 *
 * The prototype must stay fully usable without credentials or AI. Stage 1
 * ships deterministic templates only; the delivery stage wires this module to
 * a server-side function when the capability is actually connected. Until then
 * `AI_AVAILABLE` is false and the UI says so rather than pretending.
 */
export const AI_AVAILABLE = false;

export type AiUnavailable = { ok: false; reason: string };
