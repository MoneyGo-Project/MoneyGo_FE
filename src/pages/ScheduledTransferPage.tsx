import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CheckCircle as CheckIcon } from "@mui/icons-material";
import { scheduledTransferService } from "../services/scheduledTransfer.service";
import { accountService } from "../services/account.service";
import { formatCurrency, formatAccountNumber } from "../utils/format";

const ScheduledTransferPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    toAccountNumber: (location.state as any)?.toAccountNumber || "",
    amount: "",
    password: "",
    description: "",
    scheduledAt: "",
  });
  const [accountOwner, setAccountOwner] = useState("");
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

  // 최소 예약 시간 (현재시간 + 1분)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  // 최대 예약 시간 (1년 후)
  const getMaxDateTime = () => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const checkAccount = async () => {
      const accountNumber = formData.toAccountNumber.replace(/-/g, "");

      if (accountNumber.length === 12) {
        setCheckingAccount(true);
        setAccountOwner("");
        setError("");

        try {
          // 하이픈 포함 형식으로 API 호출
          const formatted = `${accountNumber.slice(0, 4)}-${accountNumber.slice(
            4,
            8
          )}-${accountNumber.slice(8, 12)}`;
          const response = await accountService.getAccountOwner(formatted);
          setAccountOwner(response.ownerName);
        } catch (err: any) {
          setError("존재하지 않는 계좌번호입니다.");
        } finally {
          setCheckingAccount(false);
        }
      } else {
        setAccountOwner("");
      }
    };

    const timeoutId = setTimeout(checkAccount, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.toAccountNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "toAccountNumber") {
      const formatted = formatAccountNumber(value.replace(/-/g, ""));
      setFormData({ ...formData, [name]: formatted });
    } else if (name === "amount") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === "password") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accountOwner) {
      setError("계좌번호를 확인해주세요.");
      return;
    }

    if (parseInt(formData.amount) < 1) {
      setError("금액은 1원 이상이어야 합니다.");
      return;
    }

    if (parseInt(formData.amount) > 1000000) {
      setError("예약 송금 최대 금액은 100만원입니다.");
      return;
    }

    if (formData.password.length !== 6) {
      setError("간편 비밀번호 6자리를 입력하세요.");
      return;
    }

    if (!formData.scheduledAt) {
      setError("예약 시간을 선택하세요.");
      return;
    }

    setLoading(true);

    try {
      // 하이픈 제거한 숫자를 다시 포맷팅하여 전송
      const accountNumber = formData.toAccountNumber.replace(/-/g, "");
      const formatted = `${accountNumber.slice(0, 4)}-${accountNumber.slice(
        4,
        8
      )}-${accountNumber.slice(8, 12)}`;

      const requestData = {
        toAccountNumber: formatted,
        amount: parseInt(formData.amount),
        password: formData.password,
        description: formData.description || "",
        scheduledAt: formData.scheduledAt, // datetime-local 값 그대로 전송
      };

      console.log("예약 송금 요청 데이터:", requestData);

      await scheduledTransferService.create(requestData);
      setSuccessDialog(true);
    } catch (err: any) {
      console.error("예약 송금 에러:", err);
      console.error("에러 응답:", err.response?.data);
      setError(err.response?.data?.message || "예약 송금에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessDialog(false);
    navigate("/scheduled-transfers");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            예약 송금
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            원하는 시간에 자동으로 송금됩니다
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="받는 계좌번호"
              name="toAccountNumber"
              value={formData.toAccountNumber}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="1234-5678-9012"
              helperText={
                checkingAccount
                  ? "확인 중..."
                  : accountOwner
                  ? `예금주: ${accountOwner}`
                  : "계좌번호를 입력하세요"
              }
              InputProps={{
                endAdornment: checkingAccount && <CircularProgress size={20} />,
              }}
            />

            <TextField
              fullWidth
              label="금액"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              margin="normal"
              helperText={
                formData.amount
                  ? `${formatCurrency(
                      parseInt(formData.amount)
                    )} (최대 100만원)`
                  : "송금할 금액을 입력하세요"
              }
            />

            <TextField
              fullWidth
              label="예약 시간"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={handleChange}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: getMinDateTime(),
                max: getMaxDateTime(),
              }}
              helperText="최소 1분 후부터 최대 1년 이내"
            />

            <TextField
              fullWidth
              label="간편 비밀번호 (6자리)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{
                maxLength: 6,
                inputMode: "numeric",
              }}
              helperText="간편 비밀번호 6자리를 입력하세요"
            />

            <TextField
              fullWidth
              label="송금 메시지 (선택)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !accountOwner}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : "예약하기"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ mt: 1 }}
            >
              취소
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={successDialog} onClose={handleCloseSuccess}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckIcon color="success" />
            예약 완료
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>예약 송금이 등록되었습니다.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            예약 시간:{" "}
            {formData.scheduledAt
              ? new Date(formData.scheduledAt).toLocaleString("ko-KR")
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccess} variant="contained">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScheduledTransferPage;
