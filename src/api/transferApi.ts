import api from './axiosConfig';
import type { TransferRequest, TransferResponse } from '../types/transaction.types';

export const transferApi = {
  // 송금
  transfer: async (data: TransferRequest): Promise<TransferResponse> => {
    const response = await api.post<TransferResponse>('/transfers', data);
    return response.data;
  },
};
