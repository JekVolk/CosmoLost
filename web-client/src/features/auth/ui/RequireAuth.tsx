import { useAuthStore } from '@/entities/user';
import type React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface RequireAuthProps {
  children?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
