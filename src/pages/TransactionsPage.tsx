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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  ListItemIcon,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ExpandLess as ExpandLessIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
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
  const [success, setSuccess] = useState("");

  // 필터 상태
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<string>("all");
  const [transactionType, setTransactionType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 영수증/내역서 다이얼로그
  const [emailDialog, setEmailDialog] = useState(false);
  const [statementDialog, setStatementDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null
  );
  const [emailAddress, setEmailAddress] = useState("");
  const [statementYear, setStatementYear] = useState(new Date().getFullYear());
  const [statementMonth, setStatementMonth] = useState<number | null>(
    new Date().getMonth() + 1
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTransaction, setMenuTransaction] = useState<number | null>(null);

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
      let params: any = { page: 0, size: 50 };

      if (transactionType) params.type = transactionType;

      const today = new Date();
      let calculatedStartDate = "";
      let calculatedEndDate = "";

      switch (dateRange) {
        case "today":
          calculatedStartDate = calculatedEndDate = today
            .toISOString()
            .split("T")[0];
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

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    transactionId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuTransaction(transactionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTransaction(null);
  };

  const handleDownloadReceipt = async (transactionId: number) => {
    try {
      const blob = await transactionService.downloadReceipt(transactionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess("영수증이 다운로드되었습니다.");
    } catch (err: any) {
      setError("영수증 다운로드에 실패했습니다.");
    }
    handleMenuClose();
  };

  const handleOpenEmailDialog = (transactionId: number) => {
    setSelectedTransaction(transactionId);
    setEmailDialog(true);
    handleMenuClose();
  };

  const handleSendEmail = async () => {
    if (!selectedTransaction || !emailAddress) return;

    try {
      await transactionService.sendReceiptEmail(
        selectedTransaction,
        emailAddress
      );
      setSuccess("영수증이 이메일로 발송되었습니다.");
      setEmailDialog(false);
      setEmailAddress("");
    } catch (err: any) {
      setError("이메일 발송에 실패했습니다.");
    }
  };

  const handleDownloadStatement = async () => {
    try {
      const blob = await transactionService.downloadStatement(
        statementYear,
        statementMonth || undefined
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = statementMonth
        ? `statement_${statementYear}_${String(statementMonth).padStart(
            2,
            "0"
          )}.pdf`
        : `statement_${statementYear}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess("거래 내역서가 다운로드되었습니다.");
      setStatementDialog(false);
    } catch (err: any) {
      setError("거래 내역서 다운로드에 실패했습니다.");
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
            startIcon={<DescriptionIcon />}
            onClick={() => setStatementDialog(true)}
          >
            내역서
          </Button>
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
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
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={getTransactionColor(transaction)}
                      >
                        {getTransactionAmount(transaction)}
                      </Typography>
                      <IconButton
                        edge="end"
                        onClick={(e) =>
                          handleMenuOpen(e, transaction.transactionId)
                        }
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  }
                >
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
                </ListItem>
              </Box>
            ))}
          </List>
        </Card>
      )}

      {/* 거래 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            menuTransaction && handleDownloadReceipt(menuTransaction)
          }
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          영수증 다운로드
        </MenuItem>
        <MenuItem
          onClick={() =>
            menuTransaction && handleOpenEmailDialog(menuTransaction)
          }
        >
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          이메일 발송
        </MenuItem>
      </Menu>

      {/* 이메일 발송 다이얼로그 */}
      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)}>
        <DialogTitle>영수증 이메일 발송</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="이메일 주소"
            type="email"
            fullWidth
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>취소</Button>
          <Button onClick={handleSendEmail} variant="contained">
            발송
          </Button>
        </DialogActions>
      </Dialog>

      {/* 거래 내역서 다운로드 다이얼로그 */}
      <Dialog open={statementDialog} onClose={() => setStatementDialog(false)}>
        <DialogTitle>거래 내역서 다운로드</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 2,
              minWidth: 300,
            }}
          >
            <TextField
              select
              label="연도"
              value={statementYear}
              onChange={(e) => setStatementYear(Number(e.target.value))}
              fullWidth
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}년
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              select
              label="월 (선택 안하면 연도별)"
              value={statementMonth || ""}
              onChange={(e) =>
                setStatementMonth(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              fullWidth
            >
              <MenuItem value="">연도별</MenuItem>
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}월
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatementDialog(false)}>취소</Button>
          <Button
            onClick={handleDownloadStatement}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            다운로드
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransactionsPage;
