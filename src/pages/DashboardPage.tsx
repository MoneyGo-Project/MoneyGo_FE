import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  QrCode2 as QrCodeIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { accountService } from '../services/account.service';
import { transactionService } from '../services/transaction.service';
import { simplePasswordService } from '../services/simplePassword.service';
import { AccountResponse, TransactionResponse } from '../types/api.types';
import { formatCurrency, formatAccountNumber, formatDateTime } from '../utils/format';
import { authService } from '../services/auth.service';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSimplePassword, setHasSimplePassword] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 계좌 정보 조회
      const accountData = await accountService.getMyAccount();
      setAccount(accountData);

      // 최근 거래 내역 조회 (최대 5개)
      const transactionsData = await transactionService.getTransactions({
        page: 0,
        size: 5,
      });
      setRecentTransactions(transactionsData.content);

      // 간편 비밀번호 등록 여부 확인
      const simplePasswordStatus = await simplePasswordService.checkStatus();
      setHasSimplePassword(simplePasswordStatus.hasSimplePassword);
    } catch (err: any) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTransactionColor = (transaction: TransactionResponse): 'success' | 'error' => {
    // 내 계좌가 fromAccount인 경우 출금
    return transaction.fromAccount === account?.accountNumber ? 'error' : 'success';
  };

  const getTransactionAmount = (transaction: TransactionResponse): string => {
    const isOutgoing = transaction.fromAccount === account?.accountNumber;
    const sign = isOutgoing ? '-' : '+';
    return `${sign}${formatCurrency(transaction.amount)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 간편 비밀번호 미등록 안내 */}
      {!hasSimplePassword && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<LockIcon />}
              onClick={() => navigate('/simple-password/register')}
            >
              등록
            </Button>
          }
        >
          송금/QR결제 시 필요한 <strong>간편 비밀번호(6자리)</strong>를 등록하세요.
        </Alert>
      )}

      {/* 계좌 잔액 카드 */}
      <Card elevation={2} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              내 계좌
            </Typography>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
            >
              새로고침
            </Button>
          </Box>
          
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {account ? formatCurrency(account.balance) : '---'}
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {account ? formatAccountNumber(account.accountNumber) : '---'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {user?.name}
          </Typography>
        </CardContent>
      </Card>

      {/* 빠른 액션 버튼 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            onClick={() => navigate('/transfer')}
            sx={{ py: 2 }}
          >
            송금하기
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<QrCodeIcon />}
            onClick={() => navigate('/qr-generate')}
            sx={{ py: 2 }}
          >
            QR결제
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<ScheduleIcon />}
            onClick={() => navigate('/scheduled-transfers')}
            sx={{ py: 2 }}
          >
            예약송금
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<StarIcon />}
            onClick={() => navigate('/favorites')}
            sx={{ py: 2 }}
          >
            즐겨찾기
          </Button>
        </Grid>
      </Grid>

      {/* 최근 거래 내역 */}
      <Card elevation={1}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              최근 거래
            </Typography>
            <Button size="small" onClick={() => navigate('/transactions')}>
              전체보기
            </Button>
          </Box>

          {recentTransactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              거래 내역이 없습니다
            </Typography>
          ) : (
            <List disablePadding>
              {recentTransactions.map((transaction, index) => (
                <Box key={transaction.transactionId}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="medium">
                            {transaction.counterpartyName}
                          </Typography>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardPage;
