"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Applicant } from "./onboarding";
type State = { applicants: Record<string, Applicant>; completed: Record<string, boolean>; saved: Record<string, string[]>; save: (id: string, profile: Applicant) => void; finish: (id: string) => void; togglePartner: (id: string, partner: string) => void };
export const useOnboarding = create<State>()(persist((set) => ({
  applicants: {}, completed: {}, saved: {},
  save: (id, profile) => set((state) => ({ applicants: { ...state.applicants, [id]: profile }, completed: { ...state.completed, [id]: false } })),
  finish: (id) => set((state) => ({ completed: { ...state.completed, [id]: true } })),
  togglePartner: (id, partner) => set((state) => { const previous = state.saved[id] ?? []; return { saved: { ...state.saved, [id]: previous.includes(partner) ? previous.filter((value) => value !== partner) : [...previous, partner] } }; }),
}), { name: "wusool-demo-onboarding", storage: createJSONStorage(() => sessionStorage), skipHydration: true, partialize: ({ applicants, completed, saved }) => ({ applicants, completed, saved }) }));
