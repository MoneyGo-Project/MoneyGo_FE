import { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import QrCodeIcon from '@mui/icons-material/QrCode';
import HistoryIcon from '@mui/icons-material/History';
import Header from '../components/common/Header';
import { accountApi } from '../api/accountApi';
import { useAccountStore } from '../store/accountStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/formatters';
import Loading from '../components/common/Loading';

const HomePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { account, setAccount } = useAccountStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const data = await accountApi.getMyAccount();
        setAccount(data);
      } catch (error) {
        console.error('Failed to fetch account:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [setAccount]);

  if (loading) return <Loading />;

  return (
    <>
      <Header title="MoneyGo" showLogout />
      <Container maxWidth="sm">
        <Box sx={{ py: 3 }}>
          {/* 계좌 카드 */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {user?.name}님의 계좌
              </Typography>
              <Typography variant="h4" component="div" sx={{ my: 2 }}>
                {account ? formatCurrency(account.balance) : '로딩 중...'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {account?.accountNumber}
              </Typography>
            </CardContent>
          </Card>

          {/* 메뉴 그리드 */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: 100, flexDirection: 'column' }}
                onClick={() => navigate('/transfer')}
              >
                <SendIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">송금</Typography>
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: 100, flexDirection: 'column' }}
                onClick={() => navigate('/qr')}
              >
                <QrCodeIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">QR결제</Typography>
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: 100, flexDirection: 'column' }}
                onClick={() => navigate('/history')}
              >
                <HistoryIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">거래내역</Typography>
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
