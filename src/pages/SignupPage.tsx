import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import Header from '../components/common/Header';
import { authApi } from '../api/authApi';
import { validateEmail, validatePassword, validatePhone } from '../utils/validators';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검증
    if (!validateEmail(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('비밀번호는 8-20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      return;
    }

    setLoading(true);
    try {
      await authApi.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      });
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="회원가입" showBack />
      <Container maxWidth="sm">
        <Box sx={{ py: 3 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                helperText="8-20자, 대소문자, 숫자, 특수문자 포함"
              />
              <TextField
                fullWidth
                label="비밀번호 확인"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="전화번호"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
                placeholder="010-1234-5678"
                required
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? '가입 중...' : '회원가입'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default SignupPage;
