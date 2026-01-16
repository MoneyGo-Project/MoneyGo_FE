import { api } from "../lib/axios";
import {
  AccountResponse,
  AccountOwnerResponse,
  SelfDepositRequest,
  SelfDepositResponse,
  AccountLockRequest,
  AccountLockStatusResponse,
} from "../types/api.types";

export const accountService = {
  // 내 계좌 조회
  getMyAccount: async (): Promise<AccountResponse> => {
    const response = await api.get<AccountResponse>("/accounts/me");
    return response.data;
  },

  // 계좌 소유자 확인
  getAccountOwner: async (
    accountNumber: string
  ): Promise<AccountOwnerResponse> => {
    const response = await api.get<AccountOwnerResponse>(
      `/accounts/${accountNumber}`
    );
    return response.data;
  },

  // 본인 계좌 입금
  selfDeposit: async (
    data: SelfDepositRequest
  ): Promise<SelfDepositResponse> => {
    const response = await api.post<SelfDepositResponse>(
      "/accounts/deposit",
      data
    );
    return response.data;
  },

  // 계좌 잠금
  lockAccount: async (): Promise<void> => {
    await api.post("/accounts/lock");
  },

  // 계좌 잠금 해제
  unlockAccount: async (data: AccountLockRequest): Promise<void> => {
    await api.post("/accounts/unlock", data);
  },

  // 계좌 잠금 상태 조회
  getLockStatus: async (): Promise<AccountLockStatusResponse> => {
    const response = await api.get<AccountLockStatusResponse>(
      "/accounts/lock-status"
    );
    return response.data;
  },
};
