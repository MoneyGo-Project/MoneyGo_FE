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
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CheckCircle as CheckIcon } from "@mui/icons-material";
import { transferService } from "../services/transfer.service";
import { accountService } from "../services/account.service";
import { formatCurrency, formatAccountNumber } from "../utils/format";
import { TransferResponse } from "../types/api.types";

const TransferPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    toAccountNumber: (location.state as any)?.toAccountNumber || "",
    amount: "",
    simplePassword: "",
    description: "",
  });
  const [accountOwner, setAccountOwner] = useState("");
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResponse | null>(
    null
  );

  // 계좌번호 확인
  useEffect(() => {
    const checkAccount = async () => {
      // 하이픈 제거한 순수 숫자만 체크
      const accountNumber = formData.toAccountNumber.replace(/-/g, "");

      // 정확히 12자리일 때만 확인
      if (accountNumber.length === 12) {
        setCheckingAccount(true);
        setAccountOwner("");
        setError("");

        try {
          // 하이픈 포함 형식으로 API 호출 (1001-1234-5678)
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
    let value = e.target.value;

    // 계좌번호 자동 포맷팅
    if (e.target.name === "toAccountNumber") {
      value = value.replace(/[^0-9]/g, "").slice(0, 12);
    }

    // 금액은 숫자만
    if (e.target.name === "amount") {
      value = value.replace(/[^0-9]/g, "");
    }

    // 간편 비밀번호는 숫자만, 최대 6자리
    if (e.target.name === "simplePassword") {
      value = value.replace(/[^0-9]/g, "").slice(0, 6);
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountOwner) {
      setError("유효한 계좌번호를 입력해주세요.");
      return;
    }

    if (parseInt(formData.amount) < 100) {
      setError("최소 송금액은 100원입니다.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 하이픈 제거한 숫자를 다시 포맷팅하여 전송
      const accountNumber = formData.toAccountNumber.replace(/-/g, "");
      const formatted = `${accountNumber.slice(0, 4)}-${accountNumber.slice(
        4,
        8
      )}-${accountNumber.slice(8, 12)}`;

      const response = await transferService.transfer({
        toAccountNumber: formatted,
        amount: parseInt(formData.amount),
        simplePassword: formData.simplePassword,
        description: formData.description || undefined,
      });

      setTransferResult(response);
      setSuccessDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "송금에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessDialog(false);
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        송금하기
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="받는 계좌번호"
              name="toAccountNumber"
              value={formatAccountNumber(formData.toAccountNumber)}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="1234-5678-9012"
              InputProps={{
                endAdornment: checkingAccount && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />

            {accountOwner && (
              <Alert severity="success" sx={{ mt: 1 }}>
                예금주: {accountOwner}
              </Alert>
            )}

            <TextField
              fullWidth
              label="송금액"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="0"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">원</InputAdornment>
                ),
              }}
              helperText={
                formData.amount && parseInt(formData.amount) > 0
                  ? formatCurrency(parseInt(formData.amount))
                  : ""
              }
            />

            <TextField
              fullWidth
              label="간편 비밀번호 (6자리)"
              name="simplePassword"
              type="simplePassword"
              value={formData.simplePassword}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
            />

            <TextField
              fullWidth
              label="메모 (선택)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !accountOwner}
              sx={{ mt: 3 }}
            >
              {loading ? "송금 중..." : "송금하기"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 송금 성공 다이얼로그 */}
      <Dialog open={successDialog} onClose={handleCloseSuccess}>
        <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
          <CheckIcon sx={{ fontSize: 60, color: "success.main", mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            송금 완료
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {transferResult && (
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ my: 2 }}>
                {formatCurrency(transferResult.amount)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {transferResult.toAccountOwner}님에게
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                잔액: {formatCurrency(transferResult.balanceAfter)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button onClick={handleCloseSuccess} variant="contained" size="large">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransferPage;
