import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Home as HomeIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  QrCode2 as QrCodeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  useEffect(() => {
    // 현재 경로에 따라 선택된 탭 업데이트
    const path = location.pathname;
    if (path === "/") setValue(0);
    else if (path === "/transfer") setValue(1);
    else if (path === "/transactions") setValue(2);
    else if (path.startsWith("/qr")) setValue(3);
    else if (path === "/profile") setValue(4);
  }, [location]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    const routes = [
      "/",
      "/transfer",
      "/transactions",
      "/qr-generate",
      "/profile",
    ];
    navigate(routes[newValue]);
  };

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction label="홈" icon={<HomeIcon />} />
        <BottomNavigationAction label="송금" icon={<SendIcon />} />
        <BottomNavigationAction label="거래내역" icon={<ReceiptIcon />} />
        <BottomNavigationAction label="QR결제" icon={<QrCodeIcon />} />
        <BottomNavigationAction label="프로필" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
