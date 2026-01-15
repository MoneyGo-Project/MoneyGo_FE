import { api } from "../lib/axios";
import { TransactionStatisticsResponse } from "../types/api.types";

export const statisticsService = {
  // 거래 통계 조회
  getStatistics: async (): Promise<TransactionStatisticsResponse> => {
    const response = await api.get<TransactionStatisticsResponse>(
      "/statistics"
    );
    return response.data;
  },
};
