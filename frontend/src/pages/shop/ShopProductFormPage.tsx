import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService, CreateShopProductDto } from '../../services/shop.service';
import FileUpload from '../../components/FileUpload/FileUpload';

const schema = yup.object({
  name: yup.string().required('Назва обов\'язкова'),
  description: yup.string().optional(),
  product_type: yup.string().oneOf(['avatar', 'profile_frame', 'badge', 'theme', 'customization', 'gift'] as const).required('Тип товару обов\'язковий'),
  price: yup.number().required('Ціна обов\'язкова').min(0, 'Ціна не може бути від\'ємною'),
  image_url: yup.string().required('Зображення обов\'язкове'),
  preview_url: yup.string().url('Невалідний URL').nullable().optional(),
  is_active: yup.boolean().optional(),
  is_premium: yup.boolean().optional(),
  category: yup.string().optional(),
  sort_order: yup.number().optional(),
});

const productTypeLabels: Record<string, string> = {
  avatar: 'Аватарка',
  profile_frame: 'Рамка профілю',
  badge: 'Бейдж',
  theme: 'Тема',
  customization: 'Кастомізація',
  gift: 'Подарунок',
};

const ShopProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['shop-product', id],
    queryFn: () => shopService.getById(id!),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateShopProductDto>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      description: '',
      product_type: 'avatar',
      price: 0,
      image_url: '',
      preview_url: '',
      is_active: true,
      is_premium: false,
      category: '',
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (product && isEdit) {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
      reset({
        name: product.name,
        description: product.description,
        product_type: product.product_type,
        price: product.price,
        image_url: product.image_url?.startsWith('http') ? product.image_url : `${baseUrl}${product.image_url}`,
        preview_url: product.preview_url?.startsWith('http') ? product.preview_url : (product.preview_url ? `${baseUrl}${product.preview_url}` : ''),
        is_active: product.is_active,
        is_premium: product.is_premium,
        category: product.category,
        sort_order: product.sort_order,
      });
    }
  }, [product, isEdit, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateShopProductDto) => shopService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      navigate('/shop');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateShopProductDto>) => shopService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      navigate('/shop');
    },
  });

  const onSubmit = (data: CreateShopProductDto) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const imageUrl = watch('image_url');
  const productType = watch('product_type');

  if (isLoadingProduct) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/shop')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Редагувати товар' : 'Створити товар'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Назва товару"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="product_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.product_type}>
                    <InputLabel>Тип товару</InputLabel>
                    <Select {...field} label="Тип товару">
                      {Object.entries(productTypeLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.product_type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.product_type.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ціна в балах"
                    type="number"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Категорія"
                    fullWidth
                    error={!!errors.category}
                    helperText={errors.category?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Зображення товару
              </Typography>
              <FileUpload
                type="image"
                value={imageUrl}
                onChange={(url) => setValue('image_url', url)}
                accept="image/*"
                maxSize={10}
                label="Завантажити зображення"
              />
              {errors.image_url && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.image_url.message as string}
                </Typography>
              )}
            </Grid>

            {(productType === 'avatar' || productType === 'profile_frame') && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Прев'ю (опційно)
                </Typography>
                <FileUpload
                  type="image"
                  value={watch('preview_url') || ''}
                  onChange={(url) => setValue('preview_url', url)}
                  accept="image/*"
                  maxSize={10}
                  label="Завантажити прев'ю"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="is_premium"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Premium товар"
                  />
                )}
              />
            </Grid>

            {(createMutation.isError || updateMutation.isError) && (
              <Grid item xs={12}>
                <Alert severity="error">
                  Помилка збереження товару
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/shop')}>
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    isEdit ? 'Зберегти' : 'Створити'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ShopProductFormPage;

