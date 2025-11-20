import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, AdminUser } from '../../services/admin.service';
import AdminUserFormDialog from '../../components/AdminUserFormDialog/AdminUserFormDialog';
import { useRole } from '../../hooks/useRole';

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useRole();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminUserToEdit, setAdminUserToEdit] = useState<AdminUser | null>(null);
  const [adminUserToDelete, setAdminUserToDelete] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      adminService.getAdminUsers({
        page,
        per_page: 20,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteDialogOpen(false);
      setAdminUserToDelete(null);
    },
  });

  const handleCreate = () => {
    setAdminUserToEdit(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (adminUser: AdminUser) => {
    setAdminUserToEdit(adminUser);
    setFormDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAdminUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (adminUserToDelete) {
      deleteMutation.mutate(adminUserToDelete);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Фільтрація по пошуку
  const filteredData = data?.data.filter(
    (admin) =>
      admin.username.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (!isSuperAdmin()) {
    return (
      <Box>
        <Alert severity="error">У вас немає прав для доступу до цієї сторінки. Потрібні права супер-адміністратора.</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">Помилка завантаження адміністраторів</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Адміністратори</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Створити адміністратора
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Пошук за ім'ям користувача або email..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ім'я користувача</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Останній вхід</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!filteredData || filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">Адміністраторів не знайдено</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((admin) => (
                <TableRow key={admin._id} hover>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        admin.role === 'super_admin'
                          ? 'Супер-адміністратор'
                          : admin.role === 'training_admin'
                          ? 'Адміністратор навчання'
                          : 'Переглядач'
                      }
                      size="small"
                      color={
                        admin.role === 'super_admin'
                          ? 'error'
                          : admin.role === 'training_admin'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.is_active ? 'Активний' : 'Неактивний'}
                      size="small"
                      color={admin.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleString('uk-UA')
                      : 'Ніколи'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleEdit(admin)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(admin._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.meta.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={data.meta.total_pages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Підтвердження деактивації</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Ви впевнені, що хочете деактивувати цього адміністратора? Адміністратор не зможе входити в систему.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Деактивувати'}
          </Button>
        </DialogActions>
      </Dialog>

      <AdminUserFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setAdminUserToEdit(null);
        }}
        adminUser={adminUserToEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          setFormDialogOpen(false);
          setAdminUserToEdit(null);
        }}
      />
    </Box>
  );
};

export default AdminUsersPage;

