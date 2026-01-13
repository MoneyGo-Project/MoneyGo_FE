import { api } from '../lib/axios';
import { QrGenerateRequest, QrGenerateResponse, QrPayRequest, QrPayResponse } from '../types/api.types';

export const qrService = {
  // QR 코드 생성
  generateQrCode: async (data: QrGenerateRequest): Promise<QrGenerateResponse> => {
    const response = await api.post<QrGenerateResponse>('/qr/generate', data);
    return response.data;
  },

  // QR 코드로 결제
  payWithQrCode: async (data: QrPayRequest): Promise<QrPayResponse> => {
    const response = await api.post<QrPayResponse>('/qr/pay', data);
    return response.data;
  },
};
