import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import { AccountBalance as AccountBalanceIcon } from "@mui/icons-material";
import { accountService } from "../services/account.service";
import { formatCurrency } from "../utils/format";

const SelfDepositPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    simplePassword: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [depositResult, setDepositResult] = useState<{
    amount: number;
    balanceAfter: number;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // 숫자만 입력 가능
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === "simplePassword") {
      // 6자리 숫자만
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.amount || parseInt(formData.amount) < 1000) {
      setError("최소 입금 금액은 1,000원입니다.");
      return;
    }

    if (formData.simplePassword.length !== 6) {
      setError("간편 비밀번호 6자리를 입력하세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await accountService.selfDeposit({
        amount: parseInt(formData.amount),
        simplePassword: formData.simplePassword,
        description: formData.description || undefined,
      });

      setDepositResult({
        amount: response.amount,
        balanceAfter: response.balanceAfter,
      });
      setSuccessDialog(true);
      setFormData({ amount: "", simplePassword: "", description: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "입금에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessDialog(false);
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <AccountBalanceIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h5" fontWeight="bold">
              내 계좌 입금
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="입금 금액"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="최소 1,000원"
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">원</InputAdornment>
                ),
              }}
              helperText={
                formData.amount
                  ? `${formatCurrency(parseInt(formData.amount))}`
                  : "입금할 금액을 입력하세요"
              }
            />

            <TextField
              label="간편 비밀번호"
              name="simplePassword"
              type="password"
              value={formData.simplePassword}
              onChange={handleChange}
              placeholder="6자리 숫자"
              required
              fullWidth
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              helperText={`${formData.simplePassword.length}/6`}
            />

            <TextField
              label="메모 (선택)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="입금 메모"
              fullWidth
              multiline
              rows={2}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "처리 중..." : "입금하기"}
            </Button>

            <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
              취소
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 입금 성공 다이얼로그 */}
      <Dialog open={successDialog} onClose={handleCloseSuccess}>
        <DialogTitle>입금 완료</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>{formatCurrency(depositResult?.amount || 0)}</strong> 입금이
            완료되었습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            현재 잔액:{" "}
            <strong>{formatCurrency(depositResult?.balanceAfter || 0)}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccess} variant="contained" fullWidth>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SelfDepositPage;
