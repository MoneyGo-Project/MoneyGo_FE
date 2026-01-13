import { api } from '../lib/axios';
import {
  ScheduledTransferRequest,
  ScheduledTransferResponse,
  PageResponse,
} from '../types/api.types';

export const scheduledTransferService = {
  // 송금 예약 생성
  create: async (data: ScheduledTransferRequest): Promise<ScheduledTransferResponse> => {
    const response = await api.post<ScheduledTransferResponse>('/scheduled-transfers', data);
    return response.data;
  },

  // 내 송금 예약 목록 조회
  getMySchedules: async (params: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<ScheduledTransferResponse>> => {
    const response = await api.get<PageResponse<ScheduledTransferResponse>>('/scheduled-transfers', {
      params: {
        page: params.page || 0,
        size: params.size || 20,
      },
    });
    return response.data;
  },

  // 송금 예약 상세 조회
  getDetail: async (scheduleId: number): Promise<ScheduledTransferResponse> => {
    const response = await api.get<ScheduledTransferResponse>(`/scheduled-transfers/${scheduleId}`);
    return response.data;
  },

  // 송금 예약 취소
  cancel: async (scheduleId: number): Promise<void> => {
    await api.delete(`/scheduled-transfers/${scheduleId}`);
  },
};
