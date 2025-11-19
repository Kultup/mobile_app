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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productTypesService, ProductType, CreateProductTypeDto, UpdateProductTypeDto } from '../../services/product-types.service';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  name: yup.string().required('Назва обов\'язкова'),
  label: yup.string().required('Відображувана назва обов\'язкова'),
  description: yup.string().optional(),
  is_active: yup.boolean().optional(),
  sort_order: yup.number().optional(),
});

const ProductTypesPage = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ProductType | null>(null);

  const { data: productTypes, isLoading, error } = useQuery({
    queryKey: ['product-types'],
    queryFn: () => productTypesService.getAll(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductTypeDto>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      label: '',
      description: '',
      is_active: true,
      sort_order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductTypeDto) => productTypesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
      setOpenDialog(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductTypeDto }) =>
      productTypesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
      setOpenDialog(false);
      setEditingType(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productTypesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-types'] });
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    },
  });

  const handleOpenDialog = (type?: ProductType) => {
    if (type) {
      setEditingType(type);
      reset({
        name: type.name,
        label: type.label,
        description: type.description || '',
        is_active: type.is_active,
        sort_order: type.sort_order,
      });
    } else {
      setEditingType(null);
      reset({
        name: '',
        label: '',
        description: '',
        is_active: true,
        sort_order: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingType(null);
    reset();
  };

  const onSubmit = (data: CreateProductTypeDto) => {
    if (editingType) {
      const { name, ...updateData } = data;
      updateMutation.mutate({ id: editingType._id, data: updateData });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteClick = (type: ProductType) => {
    setTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (typeToDelete) {
      deleteMutation.mutate(typeToDelete._id);
    }
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
        <Alert severity="error">Помилка завантаження типів товарів</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Типи товарів
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Додати тип товару
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Назва (name)</TableCell>
              <TableCell>Відображувана назва</TableCell>
              <TableCell>Опис</TableCell>
              <TableCell>Порядок</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes && productTypes.length > 0 ? (
              productTypes.map((type) => (
                <TableRow key={type._id}>
                  <TableCell>
                    <Chip label={type.name} size="small" />
                  </TableCell>
                  <TableCell>{type.label}</TableCell>
                  <TableCell>{type.description || '-'}</TableCell>
                  <TableCell>{type.sort_order}</TableCell>
                  <TableCell>
                    <Chip
                      label={type.is_active ? 'Активний' : 'Неактивний'}
                      color={type.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(type)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(type)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Типи товарів не знайдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Діалог створення/редагування */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingType ? 'Редагувати тип товару' : 'Створити тип товару'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Назва (name)"
                    fullWidth
                    disabled={!!editingType}
                    error={!!errors.name}
                    helperText={errors.name?.message as string || (editingType ? undefined : "Унікальна назва типу (наприклад, 'avatar', 'profile_frame')")}
                  />
                )}
              />
              <Controller
                name="label"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Відображувана назва"
                    fullWidth
                    error={!!errors.label}
                    helperText={errors.label?.message as string}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Опис"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message as string}
                  />
                )}
              />
              <Controller
                name="sort_order"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Порядок сортування"
                    type="number"
                    fullWidth
                    error={!!errors.sort_order}
                    helperText={errors.sort_order?.message as string}
                  />
                )}
              />
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Активний"
                  />
                )}
              />
            </Box>
            {(createMutation.isError || updateMutation.isError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Помилка збереження типу товару
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
                editingType ? 'Зберегти' : 'Створити'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Діалог підтвердження видалення */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити тип товару "{typeToDelete?.label}"? Ця дія незворотна.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductTypesPage;

