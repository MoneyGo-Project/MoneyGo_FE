import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import QrCodeIcon from "@mui/icons-material/QrCode";
import Header from "../components/common/Header";
import { transactionApi } from "../api/transactionApi";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import type { Transaction } from "../types/transaction.types";

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"ALL" | "SENT" | "RECEIVED">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [filter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await transactionApi.getTransactions({
        type: filter,
        page,
        size: 20,
      });

      if (page === 0) {
        setTransactions(response.content);
      } else {
        setTransactions((prev) => [...prev, ...response.content]);
      }

      setHasMore(response.content.length === 20);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "거래 내역을 불러올 수 없습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: "ALL" | "SENT" | "RECEIVED") => {
    setFilter(newFilter);
    setPage(0);
    setTransactions([]);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const getTransactionIcon = (
    type: string,
    fromAccount: string,
    toAccount: string
  ) => {
    if (type === "QR_PAYMENT") {
      return <QrCodeIcon color="primary" />;
    }
    // 내가 보낸 거래인지 받은 거래인지 판단 (간단히 표현)
    return fromAccount ? (
      <ArrowUpwardIcon color="error" />
    ) : (
      <ArrowDownwardIcon color="success" />
    );
  };

  const getTransactionColor = (type: string, fromAccount: string) => {
    if (type === "DEPOSIT") return "success";
    if (type === "WITHDRAWAL") return "error";
    return fromAccount ? "error" : "success";
  };

  const getTransactionSign = (type: string, fromAccount: string) => {
    if (type === "DEPOSIT") return "+";
    if (type === "WITHDRAWAL") return "-";
    return fromAccount ? "-" : "+";
  };

  if (loading && transactions.length === 0) {
    return (
      <>
        <Header title="거래 내역" showBack />
        <Container maxWidth="sm">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header title="거래 내역" showBack />
      <Container maxWidth="sm">
        <Box sx={{ py: 3 }}>
          {/* 필터 버튼 */}
          <ButtonGroup fullWidth sx={{ mb: 2 }}>
            <Button
              variant={filter === "ALL" ? "contained" : "outlined"}
              onClick={() => handleFilterChange("ALL")}
            >
              전체
            </Button>
            <Button
              variant={filter === "SENT" ? "contained" : "outlined"}
              onClick={() => handleFilterChange("SENT")}
            >
              보낸 내역
            </Button>
            <Button
              variant={filter === "RECEIVED" ? "contained" : "outlined"}
              onClick={() => handleFilterChange("RECEIVED")}
            >
              받은 내역
            </Button>
          </ButtonGroup>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 거래 내역 리스트 */}
          {transactions.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                거래 내역이 없습니다
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={3}>
              <List>
                {transactions.map((transaction, index) => (
                  <Box key={transaction.transactionId}>
                    <ListItem alignItems="flex-start">
                      <Box sx={{ mr: 2, mt: 1 }}>
                        {getTransactionIcon(
                          transaction.type,
                          transaction.fromAccount,
                          transaction.toAccount
                        )}
                      </Box>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body1" fontWeight="bold">
                              {transaction.counterpartyName}
                            </Typography>
                            <Typography
                              variant="h6"
                              color={getTransactionColor(
                                transaction.type,
                                transaction.fromAccount
                              )}
                            >
                              {getTransactionSign(
                                transaction.type,
                                transaction.fromAccount
                              )}
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {transaction.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {transaction.description}
                              </Typography>
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDateTime(transaction.createdAt)}
                              </Typography>
                              <Chip
                                label={
                                  transaction.type === "TRANSFER"
                                    ? "송금"
                                    : transaction.type === "QR_PAYMENT"
                                    ? "QR결제"
                                    : transaction.type === "DEPOSIT"
                                    ? "입금"
                                    : "출금"
                                }
                                size="small"
                                color={
                                  transaction.status === "COMPLETED"
                                    ? "success"
                                    : "default"
                                }
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < transactions.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>

              {/* 더보기 버튼 */}
              {hasMore && (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "더보기"}
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Container>
    </>
  );
};

export default TransactionHistoryPage;
