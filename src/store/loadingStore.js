import { create } from "zustand";

export const useLoadingStore = create((set, get) => ({
  count: 0,
  isLoading: false,
  increment: () =>
    set((state) => {
      const newCount = state.count + 1;
      return {
        count: newCount,
        isLoading: true,
      };
    }),
  decrement: () =>
    set((state) => {
      const newCount = Math.max(0, state.count - 1);
      return {
        count: newCount,
        isLoading: newCount > 0,
      };
    }),
}));
