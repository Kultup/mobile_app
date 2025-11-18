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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService, Category, CreateCategoryDto } from '../../services/categories.service';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Назва категорії обов\'язкова'),
  parent_id: yup.string().optional(),
  sort_order: yup.number().optional(),
  is_active: yup.boolean().optional(),
});

const QuestionCategoriesManager = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['question-categories', 'all'],
    queryFn: () => categoriesService.getQuestionCategories(true),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryDto>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      parent_id: undefined,
      sort_order: 0,
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (category: CreateCategoryDto) => categoriesService.createQuestionCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-categories'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setDialogOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryDto> }) =>
      categoriesService.updateQuestionCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-categories'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setDialogOpen(false);
      setEditingCategory(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.deleteQuestionCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-categories'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({
        name: category.name,
        parent_id: typeof category.parent_id === 'object' ? category.parent_id._id : category.parent_id || undefined,
        sort_order: category.sort_order || 0,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      reset({
        name: '',
        parent_id: undefined,
        sort_order: 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data: CreateCategoryDto) => {
    const submitData = { ...data };
    if (!submitData.parent_id) {
      delete submitData.parent_id;
    }
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete);
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
        <Alert severity="error">Помилка завантаження категорій питань</Alert>
      </Box>
    );
  }

  const parentCategories = data?.data.filter((cat) => !cat.parent_id) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Категорії питань</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Додати категорію
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Назва</TableCell>
              <TableCell>Батьківська категорія</TableCell>
              <TableCell>Порядок</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Категорій не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((category) => (
                <TableRow key={category._id} hover>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {typeof category.parent_id === 'object' ? category.parent_id.name : '-'}
                  </TableCell>
                  <TableCell>{category.sort_order || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.is_active ? 'Активна' : 'Неактивна'}
                      size="small"
                      color={category.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(category._id)}
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
            {editingCategory ? 'Редагувати категорію' : 'Додати категорію'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Назва категорії"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message as string}
                    sx={{ mb: 2 }}
                  />
                )}
              />
              <Controller
                name="parent_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Батьківська категорія (опційно)</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      label="Батьківська категорія (опційно)"
                    >
                      <MenuItem value="">Немає</MenuItem>
                      {parentCategories
                        .filter((cat) => !editingCategory || cat._id !== editingCategory._id)
                        .map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="sort_order"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Порядок сортування"
                    fullWidth
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
                {createMutation.error?.response?.data?.message ||
                  updateMutation.error?.response?.data?.message ||
                  'Помилка збереження категорії'}
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
                editingCategory ? 'Зберегти' : 'Додати'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити цю категорію? Якщо в ній є питання, видалення неможливе.
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
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionCategoriesManager;

