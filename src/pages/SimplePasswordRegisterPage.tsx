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
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { simplePasswordService } from '../services/simplePassword.service';

const SimplePasswordRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    simplePassword: '',
    simplePasswordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 간편 비밀번호는 숫자만 입력, 최대 6자리
    if (name === 'simplePassword' || name === 'simplePasswordConfirm') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.simplePassword.length !== 6) {
      setError('간편 비밀번호는 6자리 숫자여야 합니다.');
      return;
    }

    if (formData.simplePassword !== formData.simplePasswordConfirm) {
      setError('간편 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await simplePasswordService.register(formData);
      alert('간편 비밀번호가 등록되었습니다.');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '간편 비밀번호 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            간편 비밀번호 등록
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            송금, QR결제, 예약송금 시 사용할 6자리 간편 비밀번호를 등록하세요.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="로그인 비밀번호"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              helperText="본인 확인을 위해 로그인 비밀번호를 입력하세요"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="간편 비밀번호 (6자리)"
              name="simplePassword"
              type="password"
              value={formData.simplePassword}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
              helperText={`${formData.simplePassword.length}/6`}
            />

            <TextField
              fullWidth
              label="간편 비밀번호 확인"
              name="simplePasswordConfirm"
              type="password"
              value={formData.simplePasswordConfirm}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : '등록하기'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ mt: 1 }}
            >
              취소
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SimplePasswordRegisterPage;
