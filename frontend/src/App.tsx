import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell, RequireAuth } from './components/AppShell';
import CaseDetailPage from './pages/CaseDetailPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ClientsPage from './pages/ClientsPage';
import LoginPage from './pages/LoginPage';
import StatusPage from './pages/StatusPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<ClientsPage />} />
          <Route path="/clients/:clientId" element={<ClientDetailPage />} />
          <Route path="/cases/:caseId" element={<CaseDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
