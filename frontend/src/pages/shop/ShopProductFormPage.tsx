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
import { categoriesService } from '../../services/categories.service';
import { productTypesService } from '../../services/product-types.service';
import FileUpload from '../../components/FileUpload/FileUpload';
import ProductPreview from '../../components/ProductPreview/ProductPreview';

const schema = yup.object({
  name: yup.string().required('Назва обов\'язкова'),
  description: yup.string().optional(),
  product_type: yup.string().required('Тип товару обов\'язковий'),
  custom_product_type: yup.string().when('product_type', {
    is: 'custom',
    then: (schema) => schema.required('Введіть назву типу товару'),
    otherwise: (schema) => schema.optional(),
  }),
  price: yup.number().required('Ціна обов\'язкова').min(0, 'Ціна не може бути від\'ємною'),
  image_url: yup.string().required('Зображення обов\'язкове'),
  preview_url: yup.string().nullable().optional(),
  is_active: yup.boolean().optional(),
  is_premium: yup.boolean().optional(),
  category: yup.string().optional(),
  sort_order: yup.number().optional(),
});

const ShopProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: categoriesData } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: () => categoriesService.getShopCategories(),
  });

  const { data: productTypesData } = useQuery({
    queryKey: ['product-types'],
    queryFn: () => productTypesService.getAll(true), // Тільки активні типи
  });

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
    watch,
  } = useForm<any>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      description: '',
      product_type: 'avatar',
      custom_product_type: '',
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
      // Перевіряємо, чи product_type є в базі даних
      const isStandardType = productTypesData?.some((type) => type.name === product.product_type);
      
      reset({
        name: product.name,
        description: product.description,
        product_type: isStandardType ? product.product_type : 'custom',
        custom_product_type: isStandardType ? '' : product.product_type,
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
    onError: (error: any) => {
      console.error('[ShopProductFormPage] Create error:', error);
      console.error('[ShopProductFormPage] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateShopProductDto>) => shopService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      navigate('/shop');
    },
    onError: (error: any) => {
      console.error('[ShopProductFormPage] Update error:', error);
      console.error('[ShopProductFormPage] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });

  const onSubmit = (data: CreateShopProductDto) => {
    console.log('[ShopProductFormPage] Form submitted:', data);
    
    // Нормалізуємо URL перед відправкою
    const normalizedData: any = { ...data };
    
    // Якщо вибрано "custom", використовуємо custom_product_type як product_type
    if (normalizedData.product_type === 'custom') {
      if (!normalizedData.custom_product_type || normalizedData.custom_product_type.trim() === '') {
        console.error('[ShopProductFormPage] Custom product type is required');
        return;
      }
      normalizedData.product_type = normalizedData.custom_product_type.trim();
      delete normalizedData.custom_product_type;
    }
    
    // Якщо image_url містить повний URL, конвертуємо в відносний
    if (normalizedData.image_url) {
      let imageUrl = normalizedData.image_url.trim();
      
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Видаляємо домен, залишаємо тільки шлях
        imageUrl = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
      }
      
      // Видаляємо подвоєння /api/v1
      imageUrl = imageUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
      normalizedData.image_url = imageUrl;
    }
    
    // Те саме для preview_url
    if (normalizedData.preview_url) {
      let previewUrl = normalizedData.preview_url.trim();
      if (previewUrl.startsWith('http://') || previewUrl.startsWith('https://')) {
        previewUrl = previewUrl.replace(/^https?:\/\/[^\/]+/, '');
      }
      previewUrl = previewUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
      normalizedData.preview_url = previewUrl;
    }
    
    // Видаляємо порожні поля (тільки опційні)
    if (!normalizedData.preview_url || normalizedData.preview_url.trim() === '') {
      normalizedData.preview_url = undefined;
    }
    
    if (!normalizedData.category || normalizedData.category.trim() === '') {
      normalizedData.category = undefined as any;
    }
    
    console.log('[ShopProductFormPage] Normalized data:', normalizedData);
    
    if (isEdit) {
      updateMutation.mutate(normalizedData);
    } else {
      createMutation.mutate(normalizedData);
    }
  };

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
        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error('[ShopProductFormPage] Form validation errors:', errors);
          console.error('[ShopProductFormPage] Form values:', watch());
        })}>
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
                      {/* Типи з бази даних */}
                      {productTypesData?.map((type) => (
                        <MenuItem key={type._id} value={type.name}>
                          {type.label}
                        </MenuItem>
                      ))}
                      <MenuItem value="custom">Інший (ввести назву)</MenuItem>
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

            {watch('product_type') === 'custom' && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="custom_product_type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Назва типу товару"
                      fullWidth
                      placeholder="Наприклад: Фон, Ефект, Анімація..."
                      error={!!errors.custom_product_type}
                      helperText={errors.custom_product_type?.message as string}
                    />
                  )}
                />
              </Grid>
            )}

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
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Категорія</InputLabel>
                    <Select {...field} label="Категорія" value={field.value || ''}>
                      <MenuItem value="">Без категорії</MenuItem>
                      {categoriesData?.data
                        .filter((cat) => cat.is_active !== false)
                        .map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.category && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.category.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Зображення товару
              </Typography>
              <Controller
                name="image_url"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    type="image"
                    value={field.value}
                    onChange={(url) => {
                      field.onChange(url);
                    }}
                    accept="image/*"
                    maxSize={10}
                    label="Завантажити зображення"
                    folderType="articles"
                  />
                )}
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
                <Controller
                  name="preview_url"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      type="image"
                      value={field.value || ''}
                      onChange={(url) => {
                        field.onChange(url);
                      }}
                      accept="image/*"
                      maxSize={10}
                      label="Завантажити прев'ю"
                      folderType="articles"
                    />
                  )}
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
                  Помилка збереження товару: {
                    (createMutation.error as any)?.response?.data?.message ||
                    (updateMutation.error as any)?.response?.data?.message ||
                    (createMutation.error as any)?.message ||
                    (updateMutation.error as any)?.message ||
                    'Невідома помилка'
                  }
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
                  onClick={() => {
                    // Додаємо логування для діагностики
                    const formData = watch();
                    console.log('[ShopProductFormPage] Button clicked, form data:', formData);
                    console.log('[ShopProductFormPage] Form errors:', errors);
                    console.log('[ShopProductFormPage] Is form valid:', Object.keys(errors).length === 0);
                  }}
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

      {/* Preview товару */}
      {watch('name') && (
        <ProductPreview
          product={{
            name: watch('name'),
            description: watch('description'),
            product_type: watch('product_type'),
            price: watch('price'),
            image_url: watch('image_url'),
            is_premium: watch('is_premium'),
          }}
        />
      )}
    </Box>
  );
};

export default ShopProductFormPage;

