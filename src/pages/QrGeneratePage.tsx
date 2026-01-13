import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import QRCode from 'qrcode';
import { qrService } from '../services/qr.service';
import { QrGenerateResponse } from '../types/api.types';
import { formatCurrency } from '../utils/format';

const QrGeneratePage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0); // 0: 생성, 1: 스캔
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  });
  const [qrData, setQrData] = useState<QrGenerateResponse | null>(null);
  const [qrImage, setQrImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      navigate('/qr-scan');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (e.target.name === 'amount') {
      value = value.replace(/[^0-9]/g, '');
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(formData.amount) < 100) {
      setError('최소 금액은 100원입니다.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await qrService.generateQrCode({
        amount: parseInt(formData.amount),
        description: formData.description || undefined,
      });

      setQrData(response);

      // QR 코드 이미지 생성
      const qrImageUrl = await QRCode.toDataURL(response.qrCode, {
        width: 300,
        margin: 2,
      });
      setQrImage(qrImageUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'QR 코드 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ amount: '', description: '' });
    setQrData(null);
    setQrImage('');
    setError('');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        QR 결제
      </Typography>

      <Card elevation={2} sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="QR 생성" />
          <Tab label="QR 스캔" />
        </Tabs>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent>
          {!qrData ? (
            <form onSubmit={handleSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                받을 금액을 입력하고 QR 코드를 생성하세요
              </Typography>

              <TextField
                fullWidth
                label="받을 금액"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                margin="normal"
                placeholder="0"
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
                helperText={
                  formData.amount && parseInt(formData.amount) > 0
                    ? formatCurrency(parseInt(formData.amount))
                    : ''
                }
              />

              <TextField
                fullWidth
                label="메모 (선택)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={2}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? 'QR 생성 중...' : 'QR 코드 생성'}
              </Button>
            </form>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                QR 코드가 생성되었습니다
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                상대방에게 QR 코드를 보여주세요
              </Typography>

              {qrImage && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 3,
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                  }}
                >
                  <img src={qrImage} alt="QR Code" style={{ maxWidth: '100%' }} />
                </Box>
              )}

              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {formatCurrency(qrData.amount)}
                </Typography>
                {qrData.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {qrData.description}
                  </Typography>
                )}
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                이 QR 코드는 10분 후 만료됩니다
              </Alert>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleReset}
                sx={{ mt: 1 }}
              >
                새 QR 코드 생성
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default QrGeneratePage;
