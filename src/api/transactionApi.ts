import api from './axiosConfig';
import type { Transaction, TransactionListResponse } from '../types/transaction.types';

export const transactionApi = {
  // 거래 내역 조회
  getTransactions: async (params?: {
    type?: 'ALL' | 'SENT' | 'RECEIVED';
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<TransactionListResponse> => {
    const response = await api.get<TransactionListResponse>('/transactions', { params });
    return response.data;
  },

  // 거래 상세 조회
  getTransactionDetail: async (transactionId: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${transactionId}`);
    return response.data;
  },
};
