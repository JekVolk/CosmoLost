import { create } from 'zustand';

export interface DiagnosticErrorItem {
  id: string;
  source: string;
  message: string;
  timestamp: string;
  stack?: string;
  context?: Record<string, unknown>;
}

interface DiagnosticsState {
  errors: DiagnosticErrorItem[];
  addError: (
    source: string,
    message: string,
    stack?: string,
    context?: Record<string, unknown>,
  ) => void;
  clearErrors: () => void;
}

export const useDiagnosticsStore = create<DiagnosticsState>((set) => ({
  errors: [],
  addError: (source, message, stack, context) => {
    const item: DiagnosticErrorItem = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source,
      message,
      timestamp: new Date().toISOString(),
      stack,
      context,
    };
    set((state) => ({ errors: [item, ...state.errors.slice(0, 49)] }));
  },
  clearErrors: () => set({ errors: [] }),
}));
