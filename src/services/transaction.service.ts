import { api } from '../lib/axios';
import { TransactionResponse, PageResponse } from '../types/api.types';

export const transactionService = {
  // 거래 내역 조회
  getTransactions: async (params: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<TransactionResponse>> => {
    const response = await api.get<PageResponse<TransactionResponse>>('/transactions', {
      params: {
        type: params.type,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page || 0,
        size: params.size || 20,
      },
    });
    return response.data;
  },

  // 거래 상세 조회
  getTransactionDetail: async (transactionId: number): Promise<TransactionResponse> => {
    const response = await api.get<TransactionResponse>(`/transactions/${transactionId}`);
    return response.data;
  },
};
