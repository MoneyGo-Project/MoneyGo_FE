import api from './axiosConfig';
import type { QrGenerateRequest, QrGenerateResponse, QrPayRequest, QrPayResponse } from '../types/transaction.types';

export const qrApi = {
  // QR 코드 생성
  generateQr: async (data: QrGenerateRequest): Promise<QrGenerateResponse> => {
    const response = await api.post<QrGenerateResponse>('/qr/generate', data);
    return response.data;
  },

  // QR 코드로 결제
  payWithQr: async (data: QrPayRequest): Promise<QrPayResponse> => {
    const response = await api.post<QrPayResponse>('/qr/pay', data);
    return response.data;
  },
};
