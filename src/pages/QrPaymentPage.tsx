import { Container, Box, Typography } from '@mui/material';
import Header from '../components/common/Header';

const QrPaymentPage = () => {
  return (
    <>
      <Header title="QR 결제" showBack />
      <Container maxWidth="sm">
        <Box sx={{ py: 3 }}>
          <Typography>QR 결제 페이지 (구현 예정)</Typography>
        </Box>
      </Container>
    </>
  );
};

export default QrPaymentPage;
