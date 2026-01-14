import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CheckCircle as CheckIcon } from "@mui/icons-material";
import { qrService } from "../services/qr.service";
import { formatCurrency } from "../utils/format";
import { QrPayResponse } from "../types/api.types";

const QrScanPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(1); // 1: 스캔 탭
  const [formData, setFormData] = useState({
    qrCode: "",
    simplePassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [paymentResult, setPaymentResult] = useState<QrPayResponse | null>(
    null
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      navigate("/qr-generate");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

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
    setError("");
    setLoading(true);

    try {
      const response = await qrService.payWithQrCode(formData);
      setPaymentResult(response);
      setSuccessDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "QR 결제에 실패했습니다.");
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
        QR 결제
      </Typography>

      <Card elevation={2} sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="QR 생성" />
          <Tab label="QR 스캔" />
        </Tabs>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            판매자의 QR 코드를 스캔하거나 코드를 직접 입력하세요
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="QR 코드"
              name="qrCode"
              value={formData.qrCode}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="QR_20241213_abcd1234"
              helperText="QR 코드를 직접 입력하세요"
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

            <Alert severity="info" sx={{ mt: 2 }}>
              결제 전 금액과 판매자 정보를 확인하세요
            </Alert>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "결제 중..." : "결제하기"}
            </Button>
          </form>

          <Box
            sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 2 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              align="center"
            >
              💡 실제 앱에서는 카메라를 통해 QR 코드를 스캔할 수 있습니다
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 결제 성공 다이얼로그 */}
      <Dialog open={successDialog} onClose={handleCloseSuccess}>
        <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
          <CheckIcon sx={{ fontSize: 60, color: "success.main", mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            결제 완료
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {paymentResult && (
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ my: 2 }}>
                {formatCurrency(paymentResult.amount)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {paymentResult.sellerName}님에게 결제
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                잔액: {formatCurrency(paymentResult.balanceAfter)}
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

export default QrScanPage;
