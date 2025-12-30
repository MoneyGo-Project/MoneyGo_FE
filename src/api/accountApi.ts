import api from './axiosConfig';
import type { Account, AccountOwner } from '../types/account.types';

export const accountApi = {
  // 내 계좌 조회
  getMyAccount: async (): Promise<Account> => {
    const response = await api.get<Account>('/accounts/me');
    return response.data;
  },

  // 계좌번호로 소유자 조회
  getAccountOwner: async (accountNumber: string): Promise<AccountOwner> => {
    const response = await api.get<AccountOwner>(`/accounts/${accountNumber}`);
    return response.data;
  },
};
