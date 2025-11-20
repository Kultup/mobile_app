import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { adminService, AdminUser, CreateAdminUserDto, UpdateAdminUserDto } from '../../services/admin.service';
import { useMutation } from '@tanstack/react-query';

const schema = yup.object({
  username: yup.string().required("Ім'я користувача обов'язкове").min(3, "Мінімум 3 символи"),
  email: yup.string().email('Невірний формат email').required('Email обов\'язковий'),
  password: yup
    .string()
    .when('isEdit', {
      is: true,
      then: (schema) => schema.min(6, 'Мінімум 6 символів').optional(),
      otherwise: (schema) => schema.required('Пароль обов\'язковий').min(6, 'Мінімум 6 символів'),
    }),
  role: yup.string().oneOf(['super_admin', 'training_admin', 'viewer']).required('Роль обов\'язкова'),
});

interface AdminUserFormDialogProps {
  open: boolean;
  onClose: () => void;
  adminUser: AdminUser | null;
  onSuccess: () => void;
}

const AdminUserFormDialog = ({ open, onClose, adminUser, onSuccess }: AdminUserFormDialogProps) => {
  const isEdit = !!adminUser;
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'viewer' as 'super_admin' | 'training_admin' | 'viewer',
    },
  });

  useEffect(() => {
    if (adminUser) {
      reset({
        username: adminUser.username,
        email: adminUser.email,
        password: '',
        role: adminUser.role,
      });
    } else {
      reset({
        username: '',
        email: '',
        password: '',
        role: 'viewer',
      });
    }
  }, [adminUser, reset, open]);

  const createMutation = useMutation({
    mutationFn: (data: CreateAdminUserDto) => adminService.createAdminUser(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      console.error('[AdminUserFormDialog] Create error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserDto }) =>
      adminService.updateAdminUser(id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      console.error('[AdminUserFormDialog] Update error:', error);
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (isEdit && adminUser) {
        const updateData: UpdateAdminUserDto = {
          username: data.username,
          email: data.email,
          role: data.role,
        };
        // Додаємо пароль тільки якщо він введений
        if (data.password && data.password.trim()) {
          updateData.password = data.password;
        }
        await updateMutation.mutateAsync({ id: adminUser._id, data: updateData });
      } else {
        await createMutation.mutateAsync({
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
        });
      }
    } catch (error) {
      console.error('[AdminUserFormDialog] Submit error:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Редагувати адміністратора' : 'Створити адміністратора'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as any)?.response?.data?.message || 'Помилка збереження адміністратора'}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ім'я користувача"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={isEdit ? 'Новий пароль (залиште порожнім, щоб не змінювати)' : 'Пароль'}
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Роль</InputLabel>
                  <Select {...field} label="Роль" disabled={isLoading}>
                    <MenuItem value="viewer">Переглядач</MenuItem>
                    <MenuItem value="training_admin">Адміністратор навчання</MenuItem>
                    <MenuItem value="super_admin">Супер-адміністратор</MenuItem>
                  </Select>
                  {errors.role && <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>{errors.role.message}</Box>}
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Скасувати
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Збереження...' : isEdit ? 'Зберегти' : 'Створити'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminUserFormDialog;

