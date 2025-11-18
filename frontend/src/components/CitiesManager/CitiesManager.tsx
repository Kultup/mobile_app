import { useState } from 'react';
import {
  Box,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesService, City, CreateCityDto } from '../../services/cities.service';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Назва міста обов\'язкова'),
  is_active: yup.boolean().optional(),
});

const CitiesManager = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cities', 'all'],
    queryFn: () => citiesService.getAll(true), // Include inactive cities for admin view
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCityDto>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (city: CreateCityDto) => citiesService.create(city),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCityDto> }) =>
      citiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setDialogOpen(false);
      setEditingCity(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => citiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setDeleteDialogOpen(false);
      setCityToDelete(null);
    },
  });

  const handleOpenDialog = (city?: City) => {
    if (city) {
      setEditingCity(city);
      reset({
        name: city.name,
        is_active: city.is_active,
      });
    } else {
      setEditingCity(null);
      reset({
        name: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCity(null);
    reset();
  };

  const onSubmit = (data: CreateCityDto) => {
    if (editingCity) {
      updateMutation.mutate({ id: editingCity._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    setCityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (cityToDelete) {
      deleteMutation.mutate(cityToDelete);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">Помилка завантаження міст</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Міста</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Додати місто
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Назва</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Міст не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((city) => (
                <TableRow key={city._id} hover>
                  <TableCell>{city.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={city.is_active ? 'Активне' : 'Неактивне'}
                      size="small"
                      color={city.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(city)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(city._id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingCity ? 'Редагувати місто' : 'Додати місто'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Назва міста"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message as string}
                    sx={{ mb: 2 }}
                  />
                )}
              />
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Активне"
                  />
                )}
              />
            </Box>
            {(createMutation.isError || updateMutation.isError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Помилка збереження міста
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Скасувати</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                editingCity ? 'Зберегти' : 'Додати'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Підтвердження деактивації</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете деактивувати це місто? Воно не буде відображатися у списках.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Деактивувати'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitiesManager;

