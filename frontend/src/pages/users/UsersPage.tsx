import { useState } from 'react';
import {
  Typography,
  Box,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, User } from '../../services/admin.service';
import { citiesService } from '../../services/cities.service';
import { positionsService } from '../../services/positions.service';
import UserEditDialog from '../../components/UserEditDialog/UserEditDialog';

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesService.getAll,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: positionsService.getAll,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search, cityFilter, positionFilter, activeFilter],
    queryFn: () =>
      adminService.getUsers({
        page,
        per_page: 20,
        search: search || undefined,
        city_id: cityFilter || undefined,
        position_id: positionFilter || undefined,
        is_active: activeFilter,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
  });

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

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
        <Alert severity="error">Помилка завантаження користувачів</Alert>
      </Box>
    );
  }

  const handleExportTestHistory = () => {
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const url = `${baseUrl}/api/v1/admin/tests/export`;
    
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `test_history_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((error) => {
        console.error('Error exporting test history:', error);
        alert('Помилка експорту історії тестів');
      });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Користувачі
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportTestHistory}
        >
          Експортувати історію тестів
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Пошук за ПІБ..."
          value={search}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Місто</InputLabel>
          <Select
            value={cityFilter}
            label="Місто"
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Всі</MenuItem>
            {citiesData?.data.map((city) => (
              <MenuItem key={city._id} value={city._id}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Посада</InputLabel>
          <Select
            value={positionFilter}
            label="Посада"
            onChange={(e) => {
              setPositionFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Всі</MenuItem>
            {positionsData?.data.map((position) => (
              <MenuItem key={position._id} value={position._id}>
                {position.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={activeFilter === undefined ? 'all' : activeFilter ? 'active' : 'inactive'}
            label="Статус"
            onChange={(e) => {
              const value = e.target.value;
              setActiveFilter(value === 'all' ? undefined : value === 'active');
              setPage(1);
            }}
          >
            <MenuItem value="all">Всі</MenuItem>
            <MenuItem value="active">Активні</MenuItem>
            <MenuItem value="inactive">Неактивні</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ПІБ</TableCell>
              <TableCell>Місто</TableCell>
              <TableCell>Посада</TableCell>
              <TableCell align="right">Бали</TableCell>
              <TableCell align="right">Тестів</TableCell>
              <TableCell align="right">Streak</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Користувачів не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((user: User) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.city_id?.name || '-'}</TableCell>
                  <TableCell>{user.position_id?.name || '-'}</TableCell>
                  <TableCell align="right">{user.total_score}</TableCell>
                  <TableCell align="right">{user.tests_completed}</TableCell>
                  <TableCell align="right">{user.current_streak}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Активний' : 'Неактивний'}
                      size="small"
                      color={user.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setUserToEdit(user);
                        setEditDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user._id)}
                      color="error"
                    >
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
          <DialogContentText>
            Ви впевнені, що хочете деактивувати цього користувача? Користувач не зможе входити в систему.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Деактивувати'}
          </Button>
        </DialogActions>
      </Dialog>

      <UserEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
      />
    </Box>
  );
};

export default UsersPage;
