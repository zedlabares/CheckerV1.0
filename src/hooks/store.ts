// ============================================================
// store.ts
// Global application state via Zustand.
// Keeps the result, processing flag, and error message.
// ============================================================

import { create } from 'zustand'
import { AppState, ValidationResult } from '../types/posFile'

export const useAppStore = create<AppState>((set) => ({
  result: null,
  isProcessing: false,
  error: null,

  setResult: (result: ValidationResult) =>
    set({ result, isProcessing: false, error: null }),

  setProcessing: (v: boolean) =>
    set({ isProcessing: v, error: null }),

  setError: (msg: string | null) =>
    set({ error: msg, isProcessing: false }),

  reset: () =>
    set({ result: null, isProcessing: false, error: null }),
}))
