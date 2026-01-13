import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { favoriteService } from '../services/favorite.service';
import { formatAccountNumber } from '../utils/format';
import { FavoriteResponse } from '../types/api.types';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteResponse | null>(null);
  const [editForm, setEditForm] = useState({ nickname: '', memo: '' });

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getMyFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError('즐겨찾기 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFavorite) return;

    try {
      await favoriteService.delete(selectedFavorite.favoriteId);
      setDeleteDialog(false);
      setSelectedFavorite(null);
      loadFavorites();
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleEdit = async () => {
    if (!selectedFavorite) return;

    try {
      await favoriteService.update(selectedFavorite.favoriteId, editForm);
      setEditDialog(false);
      setSelectedFavorite(null);
      loadFavorites();
    } catch (err: any) {
      setError(err.response?.data?.message || '수정에 실패했습니다.');
    }
  };

  const handleTransfer = (accountNumber: string) => {
    navigate('/transfer', { state: { toAccountNumber: formatAccountNumber(accountNumber) } });
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
          즐겨찾기
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/favorites/add')}
        >
          추가
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {favorites.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <StarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              즐겨찾기가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              자주 송금하는 계좌를 즐겨찾기에 추가하세요
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/favorites/add')}
            >
              즐겨찾기 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {favorites.map((favorite) => (
            <Card key={favorite.favoriteId}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {favorite.nickname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      예금주: {favorite.accountOwnerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      계좌번호: {formatAccountNumber(favorite.accountNumber)}
                    </Typography>
                    {favorite.memo && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        메모: {favorite.memo}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleTransfer(favorite.accountNumber)}
                      >
                        송금하기
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/scheduled-transfer', {
                          state: { toAccountNumber: formatAccountNumber(favorite.accountNumber) }
                        })}
                      >
                        예약 송금
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedFavorite(favorite);
                        setEditForm({ nickname: favorite.nickname, memo: favorite.memo || '' });
                        setEditDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedFavorite(favorite);
                        setDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>즐겨찾기 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedFavorite?.nickname}을(를) 즐겨찾기에서 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>즐겨찾기 수정</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="별칭"
            value={editForm.nickname}
            onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="메모"
            value={editForm.memo}
            onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>취소</Button>
          <Button onClick={handleEdit} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FavoritesPage;
