import { create } from 'zustand';
import type { Account } from '../types/account.types';

interface AccountState {
  account: Account | null;
  setAccount: (account: Account) => void;
  updateBalance: (newBalance: number) => void;
  clearAccount: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  account: null,

  setAccount: (account) => set({ account }),

  updateBalance: (newBalance) =>
    set((state) =>
      state.account ? { account: { ...state.account, balance: newBalance } } : state
    ),

  clearAccount: () => set({ account: null }),
}));
