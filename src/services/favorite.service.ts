import { api } from '../lib/axios';
import {
  FavoriteRequest,
  FavoriteUpdateRequest,
  FavoriteResponse,
} from '../types/api.types';

export const favoriteService = {
  // 즐겨찾기 추가
  add: async (data: FavoriteRequest): Promise<FavoriteResponse> => {
    const response = await api.post<FavoriteResponse>('/favorites', data);
    return response.data;
  },

  // 내 즐겨찾기 목록 조회
  getMyFavorites: async (): Promise<FavoriteResponse[]> => {
    const response = await api.get<FavoriteResponse[]>('/favorites');
    return response.data;
  },

  // 즐겨찾기 상세 조회
  getDetail: async (favoriteId: number): Promise<FavoriteResponse> => {
    const response = await api.get<FavoriteResponse>(`/favorites/${favoriteId}`);
    return response.data;
  },

  // 즐겨찾기 수정
  update: async (
    favoriteId: number,
    data: FavoriteUpdateRequest
  ): Promise<FavoriteResponse> => {
    const response = await api.patch<FavoriteResponse>(`/favorites/${favoriteId}`, data);
    return response.data;
  },

  // 즐겨찾기 삭제
  delete: async (favoriteId: number): Promise<void> => {
    await api.delete(`/favorites/${favoriteId}`);
  },
};
