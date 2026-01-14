import { api } from "../lib/axios";
import {
  SimplePasswordRegisterRequest,
  SimplePasswordChangeRequest,
  SimplePasswordVerifyRequest,
  SimplePasswordResponse,
} from "../types/api.types";

export const simplePasswordService = {
  // 간편 비밀번호 등록
  register: async (
    data: SimplePasswordRegisterRequest
  ): Promise<SimplePasswordResponse> => {
    const response = await api.post<SimplePasswordResponse>(
      "/simple-password/register",
      data
    );
    return response.data;
  },

  // 간편 비밀번호 변경
  change: async (data: SimplePasswordChangeRequest): Promise<void> => {
    await api.patch("/auth/simple-password", data);
  },

  // 간편 비밀번호 확인
  verify: async (
    data: SimplePasswordVerifyRequest
  ): Promise<{ valid: boolean }> => {
    const response = await api.post<{ valid: boolean }>(
      "/simple-password/verify",
      data
    );
    return response.data;
  },

  // 간편 비밀번호 등록 여부 확인
  checkStatus: async (): Promise<SimplePasswordResponse> => {
    const response = await api.get<SimplePasswordResponse>(
      "/simple-password/status"
    );
    return response.data;
  },
};
