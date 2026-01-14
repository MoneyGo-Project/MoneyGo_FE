import { api } from "../lib/axios";
import {
  AccountDeleteRequest,
  LoginRequest,
  LoginResponse,
  PasswordChangeRequest,
  SignupRequest,
  SignupResponse,
  SimplePasswordChangeRequest,
} from "../types/api.types";

export const authService = {
  // 회원가입
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>("/auth/signup", data);
    return response.data;
  },

  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    const { token, user } = response.data;

    // 토큰과 사용자 정보 저장
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // 토큰 가져오기
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // 인증 여부 확인
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // 비밀번호 변경
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    await api.patch("/auth/password", data);
  },

  // 간편 비밀번호 변경
  changeSimplePassword: async (
    data: SimplePasswordChangeRequest
  ): Promise<void> => {
    await api.patch("/auth/simple-password", data);
  },

  // 계정 탈퇴
  deleteAccount: async (data: AccountDeleteRequest): Promise<void> => {
    await api.delete("/auth/account", { data });
    authService.logout();
  },
};
