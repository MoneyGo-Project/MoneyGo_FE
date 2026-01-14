import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
} from "@mui/material";
import {
  Lock as LockIcon,
  Pin as PinIcon,
  DeleteForever as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { authService } from "../services/auth.service";
import { simplePasswordService } from "../services/simplePassword.service";

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // 비밀번호 변경
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  // 간편 비밀번호 변경
  const [simplePasswordDialog, setSimplePasswordDialog] = useState(false);
  const [simplePasswordForm, setSimplePasswordForm] = useState({
    currentSimplePassword: "",
    newSimplePassword: "",
    newSimplePasswordConfirm: "",
  });

  // 계정 탈퇴
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    reason: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // 성공/에러 메시지 자동 닫힘
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handlePasswordChange = async () => {
    setError("");
    setLoading(true);

    try {
      await authService.changePassword(passwordForm);
      setPasswordDialog(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
      setSnackbar({
        open: true,
        message: "✅ 비밀번호가 변경되었습니다.",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "❌ 비밀번호 변경에 실패했습니다.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimplePasswordChange = async () => {
    setError("");
    setLoading(true);

    try {
      await simplePasswordService.change(simplePasswordForm);
      setSimplePasswordDialog(false);
      setSimplePasswordForm({
        currentSimplePassword: "",
        newSimplePassword: "",
        newSimplePasswordConfirm: "",
      });
      setSnackbar({
        open: true,
        message: "✅ 간편 비밀번호가 변경되었습니다.",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          "❌ 간편 비밀번호 변경에 실패했습니다.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    setError("");
    setLoading(true);

    try {
      await authService.deleteAccount(deleteForm);
      setSnackbar({
        open: true,
        message: "✅ 계정이 탈퇴되었습니다.",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/login", { state: { message: "계정이 탈퇴되었습니다." } });
      }, 1500);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "❌ 계정 탈퇴에 실패했습니다.",
        severity: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        프로필 & 계정 관리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* 사용자 정보 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            내 정보
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                이름
              </Typography>
              <Typography variant="body1">{user?.name}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                이메일
              </Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                계좌번호
              </Typography>
              <Typography variant="body1">{user?.accountNumber}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 보안 설정 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            보안 설정
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItem
              button
              onClick={() => setPasswordDialog(true)}
              sx={{ borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
            >
              <ListItemIcon>
                <LockIcon />
              </ListItemIcon>
              <ListItemText
                primary="비밀번호 변경"
                secondary="로그인 비밀번호를 변경합니다"
              />
              <ArrowForwardIcon color="action" />
            </ListItem>
            <ListItem
              button
              onClick={() => setSimplePasswordDialog(true)}
              sx={{ borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
            >
              <ListItemIcon>
                <PinIcon />
              </ListItemIcon>
              <ListItemText
                primary="간편 비밀번호 변경"
                secondary="송금/결제 시 사용하는 6자리 비밀번호"
              />
              <ArrowForwardIcon color="action" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* 계정 관리 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            계정 관리
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItem
              button
              onClick={() => setDeleteDialog(true)}
              sx={{ borderRadius: 1, "&:hover": { bgcolor: "error.lighter" } }}
            >
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary={<Typography color="error">계정 탈퇴</Typography>}
                secondary="계정을 삭제하고 모든 데이터를 제거합니다"
              />
              <ArrowForwardIcon color="error" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog
        open={passwordDialog}
        onClose={() => setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>비밀번호 변경</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="현재 비밀번호"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="새 비밀번호"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              fullWidth
              required
              helperText="8자 이상, 영문/숫자/특수문자 포함"
              error={
                passwordForm.newPassword.length > 0 &&
                passwordForm.newPassword.length < 8
              }
            />
            <TextField
              label="새 비밀번호 확인"
              type="password"
              value={passwordForm.newPasswordConfirm}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPasswordConfirm: e.target.value,
                })
              }
              fullWidth
              required
              error={
                passwordForm.newPasswordConfirm.length > 0 &&
                passwordForm.newPassword !== passwordForm.newPasswordConfirm
              }
              helperText={
                passwordForm.newPasswordConfirm.length > 0 &&
                passwordForm.newPassword !== passwordForm.newPasswordConfirm
                  ? "비밀번호가 일치하지 않습니다"
                  : ""
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>취소</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={
              loading ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.newPasswordConfirm ||
              passwordForm.newPassword !== passwordForm.newPasswordConfirm ||
              passwordForm.newPassword.length < 8
            }
          >
            변경
          </Button>
        </DialogActions>
      </Dialog>

      {/* 간편 비밀번호 변경 다이얼로그 */}
      <Dialog
        open={simplePasswordDialog}
        onClose={() => setSimplePasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>간편 비밀번호 변경</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="현재 간편 비밀번호"
              type="password"
              value={simplePasswordForm.currentSimplePassword}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setSimplePasswordForm({
                  ...simplePasswordForm,
                  currentSimplePassword: value,
                });
              }}
              fullWidth
              required
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              helperText={`${simplePasswordForm.currentSimplePassword.length}/6`}
            />
            <TextField
              label="새 간편 비밀번호"
              type="password"
              value={simplePasswordForm.newSimplePassword}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setSimplePasswordForm({
                  ...simplePasswordForm,
                  newSimplePassword: value,
                });
              }}
              fullWidth
              required
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              helperText={`${simplePasswordForm.newSimplePassword.length}/6`}
              error={
                simplePasswordForm.newSimplePassword.length > 0 &&
                simplePasswordForm.newSimplePassword.length < 6
              }
            />
            <TextField
              label="새 간편 비밀번호 확인"
              type="password"
              value={simplePasswordForm.newSimplePasswordConfirm}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                setSimplePasswordForm({
                  ...simplePasswordForm,
                  newSimplePasswordConfirm: value,
                });
              }}
              fullWidth
              required
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              error={
                simplePasswordForm.newSimplePasswordConfirm.length > 0 &&
                simplePasswordForm.newSimplePassword !==
                  simplePasswordForm.newSimplePasswordConfirm
              }
              helperText={
                simplePasswordForm.newSimplePasswordConfirm.length > 0 &&
                simplePasswordForm.newSimplePassword !==
                  simplePasswordForm.newSimplePasswordConfirm
                  ? "비밀번호가 일치하지 않습니다"
                  : `${simplePasswordForm.newSimplePasswordConfirm.length}/6`
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSimplePasswordDialog(false)}>취소</Button>
          <Button
            onClick={handleSimplePasswordChange}
            variant="contained"
            disabled={
              loading ||
              simplePasswordForm.currentSimplePassword.length !== 6 ||
              simplePasswordForm.newSimplePassword.length !== 6 ||
              simplePasswordForm.newSimplePasswordConfirm.length !== 6 ||
              simplePasswordForm.newSimplePassword !==
                simplePasswordForm.newSimplePasswordConfirm
            }
          >
            변경
          </Button>
        </DialogActions>
      </Dialog>

      {/* 계정 탈퇴 다이얼로그 */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography color="error" fontWeight="bold">
            계정 탈퇴
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            계정을 탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
          </Alert>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="비밀번호"
              type="password"
              value={deleteForm.password}
              onChange={(e) =>
                setDeleteForm({ ...deleteForm, password: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="탈퇴 사유 (선택)"
              multiline
              rows={3}
              value={deleteForm.reason}
              onChange={(e) =>
                setDeleteForm({ ...deleteForm, reason: e.target.value })
              }
              fullWidth
              placeholder="탈퇴 사유를 입력해주세요"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>취소</Button>
          <Button
            onClick={handleAccountDelete}
            color="error"
            variant="contained"
            disabled={loading || !deleteForm.password}
          >
            탈퇴하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar - 성공/실패 알림 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", fontSize: "1rem", fontWeight: "bold" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
