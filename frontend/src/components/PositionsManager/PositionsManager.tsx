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
import { positionsService, Position, CreatePositionDto } from '../../services/positions.service';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Назва посади обов\'язкова'),
  is_active: yup.boolean().optional(),
});

const PositionsManager = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['positions', 'all'],
    queryFn: () => positionsService.getAll(true), // Include inactive positions for admin view
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePositionDto>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (position: CreatePositionDto) => positionsService.create(position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePositionDto> }) =>
      positionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setDialogOpen(false);
      setEditingPosition(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => positionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setDeleteDialogOpen(false);
      setPositionToDelete(null);
    },
  });

  const handleOpenDialog = (position?: Position) => {
    if (position) {
      setEditingPosition(position);
      reset({
        name: position.name,
        is_active: position.is_active,
      });
    } else {
      setEditingPosition(null);
      reset({
        name: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPosition(null);
    reset();
  };

  const onSubmit = (data: CreatePositionDto) => {
    if (editingPosition) {
      updateMutation.mutate({ id: editingPosition._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    setPositionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (positionToDelete) {
      deleteMutation.mutate(positionToDelete);
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
        <Alert severity="error">Помилка завантаження посад</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Посади</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Додати посаду
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
                    Посад не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((position) => (
                <TableRow key={position._id} hover>
                  <TableCell>{position.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={position.is_active ? 'Активна' : 'Неактивна'}
                      size="small"
                      color={position.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(position)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(position._id)}
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
            {editingPosition ? 'Редагувати посаду' : 'Додати посаду'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Назва посади"
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
                    label="Активна"
                  />
                )}
              />
            </Box>
            {(createMutation.isError || updateMutation.isError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Помилка збереження посади
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
                editingPosition ? 'Зберегти' : 'Додати'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Підтвердження деактивації</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете деактивувати цю посаду? Вона не буде відображатися у списках.
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

export default PositionsManager;

