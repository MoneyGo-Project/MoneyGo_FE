import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { transactionService } from '../services/transaction.service';
import { accountService } from '../services/account.service';
import { TransactionResponse, AccountResponse } from '../types/api.types';
import { formatCurrency, formatDateTime } from '../utils/format';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: 전체, 1: 보낸내역, 2: 받은내역
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchAccount = async () => {
    try {
      const accountData = await accountService.getMyAccount();
      setAccount(accountData);
    } catch (err) {
      console.error('Failed to fetch account:', err);
    }
  };

  const fetchTransactions = async (reset = false) => {
    setError('');
    
    if (reset) {
      setLoading(true);
      setPage(0);
    }

    try {
      const typeMap = ['ALL', 'SENT', 'RECEIVED'];
      const response = await transactionService.getTransactions({
        type: typeMap[tabValue],
        page: reset ? 0 : page,
        size: 20,
      });

      if (reset) {
        setTransactions(response.content);
      } else {
        setTransactions([...transactions, ...response.content]);
      }

      setHasMore(response.number < response.totalPages - 1);
      setPage((reset ? 0 : page) + 1);
    } catch (err: any) {
      setError('거래 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  useEffect(() => {
    if (account) {
      fetchTransactions(true);
    }
  }, [tabValue, account]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTransactionColor = (transaction: TransactionResponse): 'success' | 'error' => {
    return transaction.fromAccount === account?.accountNumber ? 'error' : 'success';
  };

  const getTransactionAmount = (transaction: TransactionResponse): string => {
    const isOutgoing = transaction.fromAccount === account?.accountNumber;
    const sign = isOutgoing ? '-' : '+';
    return `${sign}${formatCurrency(transaction.amount)}`;
  };

  const getTransactionLabel = (transaction: TransactionResponse): string => {
    const isOutgoing = transaction.fromAccount === account?.accountNumber;
    return isOutgoing ? '출금' : '입금';
  };

  if (loading && transactions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          거래내역
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => fetchTransactions(true)}
        >
          새로고침
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card elevation={2} sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="전체" />
          <Tab label="보낸내역" />
          <Tab label="받은내역" />
        </Tabs>
      </Card>

      <Card elevation={1}>
        <CardContent sx={{ p: 0 }}>
          {transactions.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                거래 내역이 없습니다
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {transactions.map((transaction, index) => (
                <Box key={transaction.transactionId}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ px: 2, py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5 }}>
                          <Box>
                            <Chip
                              label={getTransactionLabel(transaction)}
                              size="small"
                              color={getTransactionColor(transaction)}
                              sx={{ mr: 1, mb: 0.5 }}
                            />
                            <Typography variant="body1" component="span" fontWeight="medium">
                              {transaction.counterpartyName}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={getTransactionColor(transaction) === 'success' ? 'success.main' : 'error.main'}
                          >
                            {getTransactionAmount(transaction)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
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
          )}

          {hasMore && transactions.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Button onClick={() => fetchTransactions(false)} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : '더보기'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TransactionsPage;
