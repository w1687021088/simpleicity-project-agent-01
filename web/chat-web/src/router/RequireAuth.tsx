import { Navigate, Outlet } from 'react-router';
import { STORAGE_KEYS } from '@/config/constant';

export default function RequireAuth() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
