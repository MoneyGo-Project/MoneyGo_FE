import { api } from "../lib/axios";
import { NotificationResponse, PageResponse } from "../types/api.types";

export const notificationService = {
  // 알림 목록 조회
  getNotifications: async (params: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<NotificationResponse>> => {
    const response = await api.get<PageResponse<NotificationResponse>>(
      "/notifications",
      {
        params: {
          page: params.page || 0,
          size: params.size || 20,
        },
      }
    );
    return response.data;
  },

  // 읽지 않은 알림 목록 조회
  getUnreadNotifications: async (params: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<NotificationResponse>> => {
    const response = await api.get<PageResponse<NotificationResponse>>(
      "/notifications/unread",
      {
        params: {
          page: params.page || 0,
          size: params.size || 20,
        },
      }
    );
    return response.data;
  },

  // 읽지 않은 알림 개수 조회
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>(
      "/notifications/unread/count"
    );
    return response.data.count;
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },

  // 알림 삭제
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // 읽은 알림 전체 삭제
  deleteAllReadNotifications: async (): Promise<void> => {
    await api.delete("/notifications/read-all");
  },
};
