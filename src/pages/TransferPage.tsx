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
  InputAdornment,
  CircularProgress,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../components/common/Header";
import { transferApi } from "../api/transferApi";
import { accountApi } from "../api/accountApi";
import { useAccountStore } from "../store/accountStore";
import { formatCurrency, formatAccountNumber } from "../utils/formatters";
import { validateAccountNumber, validateAmount } from "../utils/validators";

const TransferPage = () => {
  const navigate = useNavigate();
  const updateBalance = useAccountStore((state) => state.updateBalance);

  const [step, setStep] = useState<"input" | "confirm" | "complete">("input");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);

  // 받는 사람 계좌 조회
  const handleSearchAccount = async () => {
    setError("");

    if (!validateAccountNumber(toAccountNumber)) {
      setError("올바른 계좌번호 형식이 아닙니다. (예: 1001-1234-5678)");
      return;
    }

    setSearchLoading(true);
    try {
      const result = await accountApi.getAccountOwner(toAccountNumber);
      setRecipientName(result.ownerName);
    } catch (err: any) {
      setError(err.response?.data?.message || "계좌를 찾을 수 없습니다.");
      setRecipientName("");
    } finally {
      setSearchLoading(false);
    }
  };

  // 다음 단계로
  const handleNext = () => {
    setError("");

    if (!recipientName) {
      setError("받는 사람 계좌를 조회해주세요.");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !validateAmount(amountNum)) {
      setError("금액은 1원 이상 100만원 이하여야 합니다.");
      return;
    }

    setStep("confirm");
  };

  // 송금 실행
  const handleTransfer = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await transferApi.transfer({
        toAccountNumber,
        amount: parseFloat(amount),
        description: description || undefined,
        password,
      });

      setTransferResult(result);
      updateBalance(result.balanceAfter);
      setStep("complete");
    } catch (err: any) {
      setError(err.response?.data?.message || "송금에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 초기화
  const handleReset = () => {
    setStep("input");
    setToAccountNumber("");
    setAmount("");
    setDescription("");
    setPassword("");
    setRecipientName("");
    setError("");
    setTransferResult(null);
  };

  // 입력 화면
  if (step === "input") {
    return (
      <>
        <Header title="송금" showBack />
        <Container maxWidth="sm">
          <Box sx={{ py: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom>
                받는 사람
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="계좌번호"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  placeholder="1001-1234-5678"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchAccount}
                  disabled={searchLoading}
                  sx={{ minWidth: 80 }}
                >
                  {searchLoading ? <CircularProgress size={24} /> : "조회"}
                </Button>
              </Box>

              {recipientName && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <strong>{recipientName}</strong>님의 계좌입니다.
                </Alert>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                송금 정보
              </Typography>

              <TextField
                fullWidth
                label="금액"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={2}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleNext}
                sx={{ mt: 3 }}
                disabled={!recipientName || !amount}
              >
                다음
              </Button>
            </Paper>
          </Box>
        </Container>
      </>
    );
  }

  // 확인 화면
  if (step === "confirm") {
    return (
      <>
        <Header title="송금 확인" showBack />
        <Container maxWidth="sm">
          <Box sx={{ py: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom>
                송금 정보를 확인해주세요
              </Typography>

              <Box sx={{ my: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography color="text.secondary">받는 사람</Typography>
                  <Typography fontWeight="bold">{recipientName}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography color="text.secondary">계좌번호</Typography>
                  <Typography>
                    {formatAccountNumber(toAccountNumber)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography color="text.secondary">금액</Typography>
                  <Typography fontWeight="bold" color="primary" variant="h6">
                    {formatCurrency(parseFloat(amount))}
                  </Typography>
                </Box>
                {description && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography color="text.secondary">메모</Typography>
                    <Typography>{description}</Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="거래 비밀번호를 입력하세요"
              />

              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => setStep("input")}
                >
                  이전
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleTransfer}
                  disabled={!password || loading}
                >
                  {loading ? <CircularProgress size={24} /> : "송금하기"}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </>
    );
  }

  // 완료 화면
  return (
    <>
      <Header title="송금 완료" />
      <Container maxWidth="sm">
        <Box sx={{ py: 3 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h5" color="primary" gutterBottom>
              ✓ 송금이 완료되었습니다
            </Typography>

            <Box sx={{ my: 4 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {formatCurrency(transferResult?.amount || 0)}
              </Typography>
              <Typography color="text.secondary">
                {transferResult?.toAccountOwner}님에게 송금
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: "left", mb: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography color="text.secondary">받는 계좌</Typography>
                <Typography>{transferResult?.toAccount}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography color="text.secondary">남은 잔액</Typography>
                <Typography fontWeight="bold">
                  {formatCurrency(transferResult?.balanceAfter || 0)}
                </Typography>
              </Box>
              {transferResult?.description && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="text.secondary">메모</Typography>
                  <Typography>{transferResult.description}</Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleReset}
              >
                추가 송금
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate("/")}
              >
                홈으로
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default TransferPage;
