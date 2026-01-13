import { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { favoriteService } from "../services/favorite.service";
import { accountService } from "../services/account.service";
import { formatAccountNumber } from "../utils/format";

const FavoriteAddPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountNumber: "",
    nickname: "",
    memo: "",
  });
  const [accountOwner, setAccountOwner] = useState("");
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      const accountNumber = formData.accountNumber.replace(/-/g, "");

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
  }, [formData.accountNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "accountNumber") {
      const formatted = formatAccountNumber(value.replace(/-/g, ""));
      setFormData({ ...formData, [name]: formatted });
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

    if (!formData.nickname.trim()) {
      setError("별칭을 입력하세요.");
      return;
    }

    setLoading(true);

    try {
      // 하이픈 제거한 숫자를 다시 포맷팅하여 전송
      const accountNumber = formData.accountNumber.replace(/-/g, "");
      const formatted = `${accountNumber.slice(0, 4)}-${accountNumber.slice(
        4,
        8
      )}-${accountNumber.slice(8, 12)}`;

      await favoriteService.add({
        accountNumber: formatted,
        nickname: formData.nickname,
        memo: formData.memo,
      });
      navigate("/favorites");
    } catch (err: any) {
      setError(err.response?.data?.message || "즐겨찾기 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            즐겨찾기 추가
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            자주 송금하는 계좌를 즐겨찾기에 추가하세요
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="계좌번호"
              name="accountNumber"
              value={formData.accountNumber}
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
              label="별칭"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="예: 엄마, 친구 철수"
              helperText="쉽게 알아볼 수 있는 별칭을 입력하세요"
            />

            <TextField
              fullWidth
              label="메모 (선택)"
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              placeholder="추가 메모"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !accountOwner}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : "추가하기"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/favorites")}
              sx={{ mt: 1 }}
            >
              취소
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FavoriteAddPage;
