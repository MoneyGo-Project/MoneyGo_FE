import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { scheduledTransferService } from '../services/scheduledTransfer.service';
import { formatCurrency, formatAccountNumber, formatDateTime } from '../utils/format';
import { ScheduledTransferResponse } from '../types/api.types';

const ScheduledTransferListPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ScheduledTransferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await scheduledTransferService.getMySchedules({ page: 0, size: 50 });
      setSchedules(response.content);
      setHasMore(!response.content || response.content.length < response.totalElements);
    } catch (err: any) {
      setError('예약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;

    try {
      await scheduledTransferService.cancel(selectedSchedule);
      setDeleteDialog(false);
      setSelectedSchedule(null);
      loadSchedules();
    } catch (err: any) {
      setError(err.response?.data?.message || '취소에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'EXECUTED':
        return 'success';
      case 'CANCELLED':
        return 'default';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'EXECUTED':
        return '실행완료';
      case 'CANCELLED':
        return '취소됨';
      case 'FAILED':
        return '실행실패';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          예약 송금 목록
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/scheduled-transfer')}
        >
          새 예약
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {schedules.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              예약된 송금이 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              원하는 시간에 자동으로 송금되도록 예약하세요
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/scheduled-transfer')}
            >
              예약 송금하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {schedules.map((schedule) => (
            <Card key={schedule.scheduleId}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(schedule.amount)}
                      </Typography>
                      <Chip
                        label={getStatusLabel(schedule.status)}
                        color={getStatusColor(schedule.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      받는 계좌: {formatAccountNumber(schedule.toAccountNumber)}
                    </Typography>
                    {schedule.description && (
                      <Typography variant="body2" color="text.secondary">
                        메모: {schedule.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
                      예약 시간: {formatDateTime(schedule.scheduledAt)}
                    </Typography>
                    {schedule.executedAt && (
                      <Typography variant="body2" color="text.secondary">
                        실행 시간: {formatDateTime(schedule.executedAt)}
                      </Typography>
                    )}
                  </Box>
                  {schedule.status === 'PENDING' && (
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSelectedSchedule(schedule.scheduleId);
                        setDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>예약 취소</DialogTitle>
        <DialogContent>
          <Typography>이 예약 송금을 취소하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>아니오</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            취소하기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScheduledTransferListPage;
