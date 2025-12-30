import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SendIcon from '@mui/icons-material/Send';
import QrCodeIcon from '@mui/icons-material/QrCode';
import HistoryIcon from '@mui/icons-material/History';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getValueFromPath = (path: string) => {
    if (path === '/') return 0;
    if (path === '/transfer') return 1;
    if (path === '/qr') return 2;
    if (path === '/history') return 3;
    return 0;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/transfer');
        break;
      case 2:
        navigate('/qr');
        break;
      case 3:
        navigate('/history');
        break;
    }
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <BottomNavigation value={getValueFromPath(location.pathname)} onChange={handleChange}>
        <BottomNavigationAction label="홈" icon={<HomeIcon />} />
        <BottomNavigationAction label="송금" icon={<SendIcon />} />
        <BottomNavigationAction label="QR결제" icon={<QrCodeIcon />} />
        <BottomNavigationAction label="내역" icon={<HistoryIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
