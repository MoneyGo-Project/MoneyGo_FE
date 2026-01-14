import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  MenuItem,
  Collapse,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { transactionService } from "../services/transaction.service";
import { accountService } from "../services/account.service";
import { TransactionResponse, AccountResponse } from "../types/api.types";
import { formatCurrency, formatDateTime } from "../utils/format";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 필터 상태
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<string>("all"); // all, today, week, month, custom
  const [transactionType, setTransactionType] = useState<string>(""); // '', TRANSFER, DEPOSIT, QR_PAYMENT
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchAccount();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [dateRange, transactionType, startDate, endDate]);

  const fetchAccount = async () => {
    try {
      const accountData = await accountService.getMyAccount();
      setAccount(accountData);
    } catch (err) {
      console.error("계좌 조회 실패:", err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      let params: {
        type?: string;
        startDate?: string;
        endDate?: string;
        page: number;
        size: number;
      } = {
        page: 0,
        size: 50,
      };

      // 거래 유형 필터
      if (transactionType) {
        params.type = transactionType;
      }

      // 날짜 범위 필터
      const today = new Date();
      let calculatedStartDate = "";
      let calculatedEndDate = "";

      switch (dateRange) {
        case "today":
          calculatedStartDate = today.toISOString().split("T")[0];
          calculatedEndDate = calculatedStartDate;
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          calculatedStartDate = weekAgo.toISOString().split("T")[0];
          calculatedEndDate = today.toISOString().split("T")[0];
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          calculatedStartDate = monthAgo.toISOString().split("T")[0];
          calculatedEndDate = today.toISOString().split("T")[0];
          break;
        case "custom":
          if (startDate) calculatedStartDate = startDate;
          if (endDate) calculatedEndDate = endDate;
          break;
        default:
          // 'all' - 파라미터 없음
          break;
      }

      if (calculatedStartDate) params.startDate = calculatedStartDate;
      if (calculatedEndDate) params.endDate = calculatedEndDate;

      const response = await transactionService.getTransactions(params);
      setTransactions(response.content);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "거래 내역을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const getTransactionColor = (
    transaction: TransactionResponse
  ): "success" | "error" => {
    return transaction.fromAccount === account?.accountNumber
      ? "error"
      : "success";
  };

  const getTransactionAmount = (transaction: TransactionResponse): string => {
    const isOutgoing = transaction.fromAccount === account?.accountNumber;
    const sign = isOutgoing ? "-" : "+";
    return `${sign}${formatCurrency(transaction.amount)}`;
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "TRANSFER":
        return "송금";
      case "DEPOSIT":
        return "입금";
      case "QR_PAYMENT":
        return "QR결제";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TRANSFER":
        return "primary";
      case "DEPOSIT":
        return "success";
      case "QR_PAYMENT":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading && transactions.length === 0) {
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
          거래 내역
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={filterOpen ? <ExpandLessIcon /> : <FilterIcon />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            필터
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchTransactions}
          >
            새로고침
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* 필터 패널 */}
      <Collapse in={filterOpen}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              날짜 범위
            </Typography>
            <ToggleButtonGroup
              value={dateRange}
              exclusive
              onChange={(_, value) => value && handleDateRangeChange(value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="all">전체</ToggleButton>
              <ToggleButton value="today">오늘</ToggleButton>
              <ToggleButton value="week">이번주</ToggleButton>
              <ToggleButton value="month">이번달</ToggleButton>
              <ToggleButton value="custom">직접선택</ToggleButton>
            </ToggleButtonGroup>

            {dateRange === "custom" && (
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="시작일"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="종료일"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </Box>
            )}

            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              거래 유형
            </Typography>
            <TextField
              select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="TRANSFER">송금</MenuItem>
              <MenuItem value="DEPOSIT">입금</MenuItem>
              <MenuItem value="QR_PAYMENT">QR결제</MenuItem>
            </TextField>
          </CardContent>
        </Card>
      </Collapse>

      {/* 거래 내역 리스트 */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" gutterBottom>
              거래 내역이 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              조건에 맞는 거래 내역이 없습니다
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List>
            {transactions.map((transaction, index) => (
              <Box key={transaction.transactionId}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Chip
                          label={getTypeLabel(transaction.type)}
                          color={getTypeColor(transaction.type)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {transaction.counterpartyName || "내 계좌"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(transaction.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={getTransactionColor(transaction)}
                  >
                    {getTransactionAmount(transaction)}
                  </Typography>
                </ListItem>
              </Box>
            ))}
          </List>
        </Card>
      )}
    </Container>
  );
};

export default TransactionsPage;
