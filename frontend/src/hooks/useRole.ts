import { useAuth } from './useAuth';

export type UserRole = 'super_admin' | 'training_admin' | 'viewer';

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user || !user.role) {
      return false;
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  const isTrainingAdmin = (): boolean => {
    return hasRole(['super_admin', 'training_admin']);
  };

  const isViewer = (): boolean => {
    return hasRole('viewer');
  };

  const canEdit = (): boolean => {
    return isTrainingAdmin();
  };

  const canDelete = (): boolean => {
    return isSuperAdmin();
  };

  const canView = (): boolean => {
    return !!user && !!user.role;
  };

  return {
    user,
    role: user?.role as UserRole | undefined,
    hasRole,
    isSuperAdmin,
    isTrainingAdmin,
    isViewer,
    canEdit,
    canDelete,
    canView,
  };
};

