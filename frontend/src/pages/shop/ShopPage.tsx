import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService, ShopProduct } from '../../services/shop.service';
import { shopStatsService } from '../../services/shop-stats.service';

const productTypeLabels: Record<string, string> = {
  avatar: 'Аватарка',
  profile_frame: 'Рамка профілю',
  badge: 'Бейдж',
  theme: 'Тема',
  customization: 'Кастомізація',
  gift: 'Подарунок',
};

const ShopPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [statsPage, setStatsPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['shop-products', page, typeFilter],
    queryFn: () =>
      shopService.getAll({
        page,
        per_page: 20,
        product_type: typeFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: shopService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const handleViewStats = (id: string) => {
    setSelectedProductId(id);
    setStatsDialogOpen(true);
    setStatsPage(1);
  };

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['product-stats', selectedProductId, statsPage],
    queryFn: () => shopStatsService.getStatistics(selectedProductId!, { page: statsPage, per_page: 10 }),
    enabled: statsDialogOpen && !!selectedProductId,
  });

  const { data: popularProductsData } = useQuery({
    queryKey: ['popular-products'],
    queryFn: () => shopStatsService.getPopularProducts(10),
  });

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
        <Alert severity="error">Помилка завантаження товарів</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Магазин
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/shop/products/new')}
        >
          Додати товар
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Тип товару</InputLabel>
          <Select
            value={typeFilter}
            label="Тип товару"
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Всі</MenuItem>
            {Object.entries(productTypeLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {popularProductsData?.data && popularProductsData.data.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">Найпопулярніші товари</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Місце</TableCell>
                  <TableCell>Назва товару</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell align="right">Кількість покупок</TableCell>
                  <TableCell align="right">Виручка (балів)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {popularProductsData.data.map((product, index) => (
                  <TableRow key={product.product_id} hover>
                    <TableCell>
                      <Chip
                        label={index + 1}
                        size="small"
                        color={index === 0 ? 'warning' : index === 1 ? 'default' : index === 2 ? 'secondary' : 'default'}
                        variant={index < 3 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {product.product_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={productTypeLabels[product.product_type] || product.product_type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {product.purchase_count}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {product.total_revenue}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>Зображення</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Опис</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell align="right">Ціна</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Товарів не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((product: ShopProduct) => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Avatar src={product.image_url} variant="rounded" sx={{ width: 50, height: 50 }}>
                      🛍️
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    {product.is_premium && (
                      <Chip label="Premium" size="small" color="warning" sx={{ mt: 0.5 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={productTypeLabels[product.product_type] || product.product_type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {product.price} балів
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.is_active ? 'Активний' : 'Неактивний'}
                      size="small"
                      color={product.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewStats(product._id)}
                      color="info"
                      title="Статистика покупок"
                    >
                      <BarChartIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/shop/products/${product._id}/edit`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(product._id)}
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
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити цей товар? Цю дію неможливо скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Статистика покупок: {statsData?.product.name}
        </DialogTitle>
        <DialogContent>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : statsData ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {statsData.statistics.total_purchases}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Всього покупок
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {statsData.statistics.total_revenue}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Всього виручка (балів)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="info.main">
                      {statsData.statistics.applied_purchases}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Застосовано
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">
                      {statsData.statistics.not_applied_purchases}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Не застосовано
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Список покупок
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Користувач</TableCell>
                      <TableCell>Місто</TableCell>
                      <TableCell>Посада</TableCell>
                      <TableCell align="right">Ціна</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Дата покупки</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsData.purchases.data.map((purchase, index) => (
                      <TableRow key={index}>
                        <TableCell>{purchase.user.full_name}</TableCell>
                        <TableCell>{purchase.user.city?.name || '-'}</TableCell>
                        <TableCell>{purchase.user.position?.name || '-'}</TableCell>
                        <TableCell align="right">{purchase.price_paid} балів</TableCell>
                        <TableCell>
                          <Chip
                            label={purchase.is_applied ? 'Застосовано' : 'Не застосовано'}
                            size="small"
                            color={purchase.is_applied ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.purchased_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {statsData.purchases.meta.total_pages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={statsData.purchases.meta.total_pages}
                    page={statsPage}
                    onChange={(_, value) => setStatsPage(value)}
                    size="small"
                  />
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>Закрити</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShopPage;
