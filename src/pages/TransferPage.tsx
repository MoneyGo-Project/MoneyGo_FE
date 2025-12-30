import { Container, Box, Typography } from '@mui/material';
import Header from '../components/common/Header';

const TransferPage = () => {
  return (
    <>
      <Header title="송금" showBack />
      <Container maxWidth="sm">
        <Box sx={{ py: 3 }}>
          <Typography>송금 페이지 (구현 예정)</Typography>
        </Box>
      </Container>
    </>
  );
};

export default TransferPage;
