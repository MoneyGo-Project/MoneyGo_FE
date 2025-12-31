import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress,
  Divider,
} from "@mui/material";
import QRCode from "react-qr-code";
import Header from "../components/common/Header";
import { qrApi } from "../api/qrApi";
import { useAccountStore } from "../store/accountStore";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { validateAmount } from "../utils/validators";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const QrPaymentPage = () => {
  const navigate = useNavigate();
  const updateBalance = useAccountStore((state) => state.updateBalance);
  const [tabValue, setTabValue] = useState(0);

  // QR 생성 상태
  const [generateAmount, setGenerateAmount] = useState("");
  const [generateDescription, setGenerateDescription] = useState("");
  const [generatedQr, setGeneratedQr] = useState<any>(null);
  const [generateError, setGenerateError] = useState("");
  const [generateLoading, setGenerateLoading] = useState(false);

  // QR 결제 상태
  const [payQrCode, setPayQrCode] = useState("");
  const [payPassword, setPayPassword] = useState("");
  const [payResult, setPayResult] = useState<any>(null);
  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // QR 생성
  const handleGenerateQr = async () => {
    setGenerateError("");

    const amountNum = parseFloat(generateAmount);
    if (isNaN(amountNum) || !validateAmount(amountNum)) {
      setGenerateError("금액은 1원 이상 100만원 이하여야 합니다.");
      return;
    }

    setGenerateLoading(true);
    try {
      const result = await qrApi.generateQr({
        amount: amountNum,
        description: generateDescription || undefined,
      });
      setGeneratedQr(result);
    } catch (err: any) {
      setGenerateError(
        err.response?.data?.message || "QR 생성에 실패했습니다."
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  // QR 결제
  const handlePayWithQr = async () => {
    setPayError("");

    if (!payQrCode.trim()) {
      setPayError("QR 코드를 입력해주세요.");
      return;
    }

    if (!payPassword.trim()) {
      setPayError("비밀번호를 입력해주세요.");
      return;
    }

    setPayLoading(true);
    try {
      const result = await qrApi.payWithQr({
        qrCode: payQrCode,
        password: payPassword,
      });
      setPayResult(result);
      updateBalance(result.balanceAfter);
    } catch (err: any) {
      setPayError(err.response?.data?.message || "QR 결제에 실패했습니다.");
    } finally {
      setPayLoading(false);
    }
  };

  // QR 생성 초기화
  const handleResetGenerate = () => {
    setGenerateAmount("");
    setGenerateDescription("");
    setGeneratedQr(null);
    setGenerateError("");
  };

  // QR 결제 초기화
  const handleResetPay = () => {
    setPayQrCode("");
    setPayPassword("");
    setPayResult(null);
    setPayError("");
  };

  return (
    <>
      <Header title="QR 결제" showBack />
      <Container maxWidth="sm">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} centered>
            <Tab label="QR 생성" />
            <Tab label="QR 결제" />
          </Tabs>
        </Box>

        {/* QR 생성 탭 */}
        <TabPanel value={tabValue} index={0}>
          {!generatedQr ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              {generateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {generateError}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom>
                받을 금액을 입력하세요
              </Typography>

              <TextField
                fullWidth
                label="금액"
                type="number"
                value={generateAmount}
                onChange={(e) => setGenerateAmount(e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">원</InputAdornment>
                  ),
                }}
                helperText="최대 100만원"
              />

              <TextField
                fullWidth
                label="메모 (선택사항)"
                value={generateDescription}
                onChange={(e) => setGenerateDescription(e.target.value)}
                margin="normal"
                multiline
                rows={2}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerateQr}
                disabled={!generateAmount || generateLoading}
                sx={{ mt: 3 }}
              >
                {generateLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "QR 코드 생성"
                )}
              </Button>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                생성된 QR 코드
              </Typography>

              <Box
                sx={{
                  my: 3,
                  p: 2,
                  bgcolor: "white",
                  display: "inline-block",
                  borderRadius: 2,
                }}
              >
                <QRCode value={generatedQr.qrCode} size={200} />
              </Box>

              <Typography variant="h5" color="primary" gutterBottom>
                {formatCurrency(generatedQr.amount)}
              </Typography>

              {generatedQr.description && (
                <Typography color="text.secondary" gutterBottom>
                  {generatedQr.description}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: "left", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    QR 코드
                  </Typography>
                  <Typography variant="body2">{generatedQr.qrCode}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    만료 시간
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(generatedQr.expiresAt)}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                QR 코드는 10분 동안 유효합니다
              </Alert>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleResetGenerate}
                >
                  새로 생성
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/")}
                >
                  홈으로
                </Button>
              </Box>
            </Paper>
          )}
        </TabPanel>

        {/* QR 결제 탭 */}
        <TabPanel value={tabValue} index={1}>
          {!payResult ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              {payError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {payError}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom>
                QR 코드를 입력하세요
              </Typography>

              <TextField
                fullWidth
                label="QR 코드"
                value={payQrCode}
                onChange={(e) => setPayQrCode(e.target.value)}
                margin="normal"
                placeholder="QR_20251229_abc12345"
                helperText="판매자의 QR 코드를 입력하거나 스캔하세요"
              />

              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                value={payPassword}
                onChange={(e) => setPayPassword(e.target.value)}
                margin="normal"
                helperText="거래 비밀번호를 입력하세요"
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePayWithQr}
                disabled={!payQrCode || !payPassword || payLoading}
                sx={{ mt: 3 }}
              >
                {payLoading ? <CircularProgress size={24} /> : "결제하기"}
              </Button>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h5" color="primary" gutterBottom>
                ✓ 결제가 완료되었습니다
              </Typography>

              <Box sx={{ my: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(payResult.amount)}
                </Typography>
                <Typography color="text.secondary">
                  {payResult.sellerName}님에게 결제
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: "left", mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="text.secondary">판매자 계좌</Typography>
                  <Typography>{payResult.sellerAccount}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="text.secondary">남은 잔액</Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(payResult.balanceAfter)}
                  </Typography>
                </Box>
                {payResult.description && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography color="text.secondary">메모</Typography>
                    <Typography>{payResult.description}</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button fullWidth variant="outlined" onClick={handleResetPay}>
                  추가 결제
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/")}
                >
                  홈으로
                </Button>
              </Box>
            </Paper>
          )}
        </TabPanel>
      </Container>
    </>
  );
};

export default QrPaymentPage;
