import { api } from "../lib/axios";
import { TransactionResponse, PageResponse } from "../types/api.types";

export const transactionService = {
  // 거래 내역 필터링 조회
  getTransactions: async (params: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<TransactionResponse>> => {
    const response = await api.get<PageResponse<TransactionResponse>>(
      "/transactions/filter",
      {
        params: {
          type: params.type,
          startDate: params.startDate,
          endDate: params.endDate,
          page: params.page || 0,
          size: params.size || 20,
        },
      }
    );
    return response.data;
  },

  // 거래 상세 조회
  getTransactionDetail: async (
    transactionId: number
  ): Promise<TransactionResponse> => {
    const response = await api.get<TransactionResponse>(
      `/transactions/${transactionId}`
    );
    return response.data;
  },

  // 거래 영수증 PDF 다운로드
  downloadReceipt: async (transactionId: number): Promise<Blob> => {
    const response = await api.get<Blob>(
      `/transactions/${transactionId}/receipt`,
      {
        responseType: "blob",
      }
    );
    return response.data as Blob;
  },

  // 거래 영수증 이메일 발송
  sendReceiptEmail: async (
    transactionId: number,
    email: string
  ): Promise<void> => {
    await api.post(`/transactions/${transactionId}/receipt/email`, { email });
  },

  // 거래 내역서 PDF 다운로드
  downloadStatement: async (year: number, month?: number): Promise<Blob> => {
    const response = await api.get<Blob>("/transactions/statement", {
      params: { year, month },
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
