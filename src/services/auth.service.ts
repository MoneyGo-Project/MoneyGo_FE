import { api } from '../lib/axios';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '../types/api.types';

export const authService = {
  // 회원가입
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>('/auth/signup', data);
    return response.data;
  },

  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    const { token, user } = response.data;
    
    // 토큰과 사용자 정보 저장
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 토큰 가져오기
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // 인증 여부 확인
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
