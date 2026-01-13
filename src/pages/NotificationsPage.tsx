import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { notificationService } from "../services/notification.service";
import { formatCurrency, formatDateTime } from "../utils/format";
import { NotificationResponse } from "../types/api.types";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [readNotifications, setReadNotifications] = useState<Set<number>>(
    () => {
      // localStorage에서 읽은 알림 ID 로드
      const saved = localStorage.getItem("readNotifications");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
  );

  useEffect(() => {
    loadNotifications();
  }, [tab]);

  // readNotifications 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(
      "readNotifications",
      JSON.stringify(Array.from(readNotifications))
    );
  }, [readNotifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response =
        tab === "all"
          ? await notificationService.getNotifications({ page: 0, size: 50 })
          : await notificationService.getUnreadNotifications({
              page: 0,
              size: 50,
            });

      // 서버 데이터와 로컬 읽음 상태를 병합
      const mergedNotifications = response.content.map((n) => ({
        ...n,
        isRead: n.isRead || readNotifications.has(n.notificationId),
      }));

      setNotifications(mergedNotifications);
    } catch (err: any) {
      setError("알림을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      // 1. 백엔드 API 호출
      await notificationService.markAsRead(notificationId);

      // 2. 읽은 알림 ID를 로컬에 저장
      setReadNotifications((prev) => new Set(prev).add(notificationId));

      // 3. 로컬 상태 업데이트 (NEW 제거)
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "알림 읽음 처리에 실패했습니다.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // 1. 백엔드 API 호출
      await notificationService.markAllAsRead();

      // 2. 모든 알림 ID를 로컬에 저장
      const allIds = notifications.map((n) => n.notificationId);
      setReadNotifications((prev) => {
        const newSet = new Set(prev);
        allIds.forEach((id) => newSet.add(id));
        return newSet;
      });

      // 3. 로컬 상태 업데이트 (모든 NEW 제거)
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "전체 읽음 처리에 실패했습니다.");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TRANSFER_RECEIVED":
        return "success";
      case "TRANSFER_SENT":
        return "primary";
      case "QR_PAYMENT_RECEIVED":
      case "QR_PAYMENT_SENT":
        return "secondary";
      case "SCHEDULED_TRANSFER_EXECUTED":
        return "info";
      case "SCHEDULED_TRANSFER_FAILED":
        return "error";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "TRANSFER_RECEIVED":
        return "입금";
      case "TRANSFER_SENT":
        return "출금";
      case "QR_PAYMENT_RECEIVED":
      case "QR_PAYMENT_SENT":
        return "QR결제";
      case "SCHEDULED_TRANSFER_EXECUTED":
        return "예약송금";
      case "SCHEDULED_TRANSFER_FAILED":
        return "예약실패";
      default:
        return "알림";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          알림
        </Typography>
        {tab === "unread" && notifications.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckIcon />}
            onClick={handleMarkAllAsRead}
          >
            전체 읽음
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="전체" value="all" />
          <Tab label="읽지 않음" value="unread" />
        </Tabs>
      </Box>

      {notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <NotificationsIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              {tab === "all" ? "알림이 없습니다" : "읽지 않은 알림이 없습니다"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              거래 내역이 발생하면 알림이 표시됩니다
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {notifications.map((notification) => (
            <Card
              key={notification.notificationId}
              sx={{
                bgcolor: notification.isRead ? "transparent" : "action.hover",
                cursor: notification.isRead ? "default" : "pointer",
              }}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification.notificationId);
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Chip
                        label={getTypeLabel(notification.type)}
                        color={getTypeColor(notification.type)}
                        size="small"
                      />
                      {!notification.isRead && (
                        <Chip label="NEW" color="error" size="small" />
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      fontWeight={notification.isRead ? "normal" : "bold"}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {notification.content}
                    </Typography>
                    {notification.amount > 0 && (
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ mt: 0.5, fontWeight: "medium" }}
                      >
                        {formatCurrency(notification.amount)}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {formatDateTime(notification.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default NotificationsPage;
