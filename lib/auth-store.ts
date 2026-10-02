"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  initialDemoAuth,
  registerDemo,
  sanitizeDemoAuth,
  signInDemo,
  signInDemoWithUaePass,
  signOutDemo,
  type DemoAuthData,
  type DemoAuthResult,
} from "./demo-auth";

type AuthState = DemoAuthData & {
  signIn: (email: string, code: string) => DemoAuthResult;
  register: (name: string, email: string) => DemoAuthResult;
  signInWithUaePass: () => void;
  signOut: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialDemoAuth(),
      signIn: (email, code) => {
        const change = signInDemo(get(), email, code);
        if (change.result.ok) set(change.state);
        return change.result;
      },
      register: (name, email) => {
        const change = registerDemo(get(), name, email);
        if (change.result.ok) set(change.state);
        return change.result;
      },
      signInWithUaePass: () => set(signInDemoWithUaePass(get())),
      signOut: () => set(signOutDemo(get())),
    }),
    {
      name: "wusool-demo-auth",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => sanitizeDemoAuth(state),
      merge: (saved, current) => ({ ...current, ...sanitizeDemoAuth(saved) }),
      migrate: (saved) => sanitizeDemoAuth(saved),
    },
  ),
);
