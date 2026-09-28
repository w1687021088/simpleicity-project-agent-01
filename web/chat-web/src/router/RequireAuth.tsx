import { Navigate, Outlet, useLocation } from 'react-router';
import { STORAGE_KEYS } from '@/config/constant';

export default function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
