import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService, Category, CreateCategoryDto } from '../../services/categories.service';

const ShopCategoriesManager = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    sort_order: 0,
    is_active: true,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => categoriesService.getShopCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (category: CreateCategoryDto) => categoriesService.createShopCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-categories'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: CreateCategoryDto }) =>
      categoriesService.updateShopCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-categories'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.deleteShopCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-categories'] });
    },
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        sort_order: category.sort_order || 0,
        is_active: category.is_active !== undefined ? category.is_active : true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        sort_order: 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, category: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Помилка завантаження категорій</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Додати категорію
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Назва</TableCell>
              <TableCell align="right">Порядок сортування</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Категорій не знайдено
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((category) => (
                <TableRow key={category._id} hover>
                  <TableCell>{category.name}</TableCell>
                  <TableCell align="right">{category.sort_order || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.is_active ? 'Активна' : 'Неактивна'}
                      size="small"
                      color={category.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(category._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Редагувати категорію' : 'Створити категорію'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Назва"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Порядок сортування"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                label="Статус"
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              >
                <MenuItem value="active">Активна</MenuItem>
                <MenuItem value="inactive">Неактивна</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
          >
            {editingCategory ? 'Зберегти' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShopCategoriesManager;

