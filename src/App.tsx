import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { authService } from "./services/auth.service";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TransferPage from "./pages/TransferPage";
import TransactionsPage from "./pages/TransactionsPage";
import QrGeneratePage from "./pages/QrGeneratePage";
import QrScanPage from "./pages/QrScanPage";
import SimplePasswordRegisterPage from "./pages/SimplePasswordRegisterPage";
import ScheduledTransferPage from "./pages/ScheduledTransferPage";
import ScheduledTransferListPage from "./pages/ScheduledTransferListPage";
import NotificationsPage from "./pages/NotificationsPage";
import FavoritesPage from "./pages/FavoritesPage";
import FavoriteAddPage from "./pages/FavoriteAddPage";
import SelfDepositPage from "./pages/SelfDepositPage";
import ProfilePage from "./pages/ProfilePage";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route (로그인 상태에서는 접근 불가)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Box sx={{ height: "100vh", overflow: "hidden" }}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="deposit" element={<SelfDepositPage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="qr-generate" element={<QrGeneratePage />} />
          <Route path="qr-scan" element={<QrScanPage />} />
          <Route
            path="simple-password/register"
            element={<SimplePasswordRegisterPage />}
          />
          <Route
            path="scheduled-transfer"
            element={<ScheduledTransferPage />}
          />
          <Route
            path="scheduled-transfers"
            element={<ScheduledTransferListPage />}
          />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="favorites/add" element={<FavoriteAddPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
