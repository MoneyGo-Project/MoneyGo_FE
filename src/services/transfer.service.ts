import { api } from '../lib/axios';
import { TransferRequest, TransferResponse } from '../types/api.types';

export const transferService = {
  // 송금
  transfer: async (data: TransferRequest): Promise<TransferResponse> => {
    const response = await api.post<TransferResponse>('/transfers', data);
    return response.data;
  },
};
