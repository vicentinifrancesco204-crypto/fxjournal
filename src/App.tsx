import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TradeProvider } from './context/TradeContext';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import AddTrade from './pages/AddTrade';
import LotCalculator from './pages/LotCalculator';
import CalendarPage from './pages/Calendar';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TradeProvider>
          <Routes>
            {/* Public Login Page */}
            <Route path="/login" element={<Login />} />

            {/* Protected Dashboard Layout & Pages */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="journal" element={<Journal />} />
              <Route path="add-trade" element={<AddTrade />} />
              <Route path="lot-calculator" element={<LotCalculator />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback - redirect to home (which will redirect to login if unauth) */}
            <Route path="*" element={<DashboardLayout />} />
          </Routes>
        </TradeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
