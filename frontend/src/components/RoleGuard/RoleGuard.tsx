import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { useRole, UserRole } from '../../hooks/useRole';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: UserRole | UserRole[];
  fallback?: ReactNode;
  showError?: boolean;
}

export const RoleGuard = ({ children, requiredRoles, fallback, showError = true }: RoleGuardProps) => {
  const { hasRole, canView } = useRole();

  if (!canView()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(requiredRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <Typography variant="h6">Доступ заборонено</Typography>
            <Typography variant="body2">
              У вас немає прав для доступу до цієї сторінки. Потрібні права: {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
            </Typography>
          </Alert>
        </Box>
      );
    }

    return null;
  }

  return <>{children}</>;
};

