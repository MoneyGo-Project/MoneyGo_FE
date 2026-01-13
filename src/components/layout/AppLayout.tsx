import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import BottomNav from './BottomNav';

const AppLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
          pb: 8, // 하단 네비게이션 공간
        }}
      >
        <Outlet />
      </Box>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
};

export default AppLayout;
