import { Container, Box, Typography } from '@mui/material';
import Header from '../components/common/Header';

const TransactionHistoryPage = () => {
  return (
    <>
      <Header title="거래 내역" showBack />
      <Container maxWidth="sm">
        <Box sx={{ py: 3 }}>
          <Typography>거래 내역 페이지 (구현 예정)</Typography>
        </Box>
      </Container>
    </>
  );
};

export default TransactionHistoryPage;
