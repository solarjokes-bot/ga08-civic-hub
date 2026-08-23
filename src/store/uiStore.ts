import { create } from "zustand";

/**
 * Small global UI store (Zustand, per tech-stack spec — no Redux).
 *
 * Phase 1 only tracks whether the persistent "unofficial site" notice
 * has been acknowledged for the session (it always stays visible per
 * the trust requirement — this only affects, e.g., whether we show a
 * one-time expanded first-visit version of it). Guided-help session
 * state, chat/voice call state, etc. get their own stores in Phases 3–4
 * rather than growing this one into a god-object.
 */
interface UIState {
  hasSeenWelcome: boolean;
  markWelcomeSeen: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  hasSeenWelcome: false,
  markWelcomeSeen: () => set({ hasSeenWelcome: true }),
}));
