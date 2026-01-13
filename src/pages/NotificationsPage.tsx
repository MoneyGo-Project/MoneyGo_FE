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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
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
      const saved = localStorage.getItem("readNotifications");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    notificationId: number | null;
    isAll: boolean;
  }>({ open: false, notificationId: null, isAll: false });

  useEffect(() => {
    loadNotifications();
  }, [tab]);

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
      await notificationService.markAsRead(notificationId);
      setReadNotifications((prev) => new Set(prev).add(notificationId));
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
      await notificationService.markAllAsRead();
      const allIds = notifications.map((n) => n.notificationId);
      setReadNotifications((prev) => {
        const newSet = new Set(prev);
        allIds.forEach((id) => newSet.add(id));
        return newSet;
      });
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

  const handleDeleteClick = (notificationId: number) => {
    setDeleteDialog({ open: true, notificationId, isAll: false });
  };

  const handleDeleteAllClick = () => {
    setDeleteDialog({ open: true, notificationId: null, isAll: true });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteDialog.isAll) {
        // 읽은 알림 전체 삭제
        await notificationService.deleteAllReadNotifications();
        // 로컬에서도 읽은 알림 제거
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        // localStorage에서 삭제된 알림 ID 제거
        const readIds = notifications
          .filter((n) => n.isRead)
          .map((n) => n.notificationId);
        setReadNotifications((prev) => {
          const newSet = new Set(prev);
          readIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      } else if (deleteDialog.notificationId) {
        // 개별 알림 삭제
        await notificationService.deleteNotification(
          deleteDialog.notificationId
        );
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== deleteDialog.notificationId)
        );
        // localStorage에서도 제거
        setReadNotifications((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deleteDialog.notificationId!);
          return newSet;
        });
      }
      setDeleteDialog({ open: false, notificationId: null, isAll: false });
    } catch (err: any) {
      setError(err.response?.data?.message || "알림 삭제에 실패했습니다.");
      setDeleteDialog({ open: false, notificationId: null, isAll: false });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, notificationId: null, isAll: false });
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

  const readNotificationsCount = notifications.filter((n) => n.isRead).length;

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
        <Box sx={{ display: "flex", gap: 1 }}>
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
          {tab === "all" && readNotificationsCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={handleDeleteAllClick}
            >
              읽은 알림 삭제
            </Button>
          )}
        </Box>
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
                  <Box
                    sx={{
                      flex: 1,
                      cursor: notification.isRead ? "default" : "pointer",
                    }}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.notificationId);
                      }
                    }}
                  >
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
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      handleDeleteClick(notification.notificationId)
                    }
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>
          {deleteDialog.isAll ? "읽은 알림 전체 삭제" : "알림 삭제"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialog.isAll
              ? `읽은 알림 ${readNotificationsCount}개를 모두 삭제하시겠습니까?`
              : "이 알림을 삭제하시겠습니까?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationsPage;
