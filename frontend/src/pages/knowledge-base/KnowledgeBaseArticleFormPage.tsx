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
import { knowledgeBaseService, CreateKnowledgeArticleDto } from '../../services/knowledge-base.service';
import MarkdownEditor from '../../components/MarkdownEditor/MarkdownEditor';
import FileUpload from '../../components/FileUpload/FileUpload';
import { categoriesService } from '../../services/categories.service';

const schema = yup.object({
  category_id: yup.string().required('Категорія обов\'язкова'),
  title: yup.string().required('Назва обов\'язкова'),
  content: yup.string().required('Контент обов\'язковий'),
  image_url: yup.string().nullable().optional().test('url-or-empty', 'Невалідний URL', function(value) {
    if (!value || value === '') return true;
    // Дозволяємо як повні URL, так і відносні шляхи
    return value.startsWith('/') || value.startsWith('http') || value.startsWith('blob:');
  }),
  pdf_url: yup.string().nullable().optional().test('url-or-empty', 'Невалідний URL', function(value) {
    if (!value || value === '') return true;
    // Дозволяємо як повні URL, так і відносні шляхи
    return value.startsWith('/') || value.startsWith('http') || value.startsWith('blob:');
  }),
  is_active: yup.boolean().optional(),
});

const KnowledgeBaseArticleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['knowledge-base-article', id],
    queryFn: () => knowledgeBaseService.getArticle(id!),
    enabled: isEdit,
  });

  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['knowledge-base-categories'],
    queryFn: async () => {
      console.log('[KnowledgeBaseArticleFormPage] Starting categories fetch...');
      try {
        const response = await categoriesService.getKnowledgeBaseCategories(true);
        console.log('[KnowledgeBaseArticleFormPage] Categories response:', response);
        const categoriesList = response?.data || [];
        console.log('[KnowledgeBaseArticleFormPage] Categories list:', categoriesList);
        return categoriesList;
      } catch (error) {
        console.error('[KnowledgeBaseArticleFormPage] Error in queryFn:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug: перевірити чи завантажуються категорії
  useEffect(() => {
    console.log('[KnowledgeBaseArticleFormPage] Categories state:', {
      isLoading: isLoadingCategories,
      hasError: !!categoriesError,
      categoriesCount: Array.isArray(categories) ? categories.length : 0,
      categories: categories,
      categoriesType: typeof categories,
      isArray: Array.isArray(categories),
    });
    if (categoriesError) {
      console.error('[KnowledgeBaseArticleFormPage] Error loading categories:', categoriesError);
    }
    if (categories) {
      console.log('[KnowledgeBaseArticleFormPage] Categories loaded:', Array.isArray(categories) ? categories.length : 'not array', categories);
    }
  }, [categories, categoriesError, isLoadingCategories]);


  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateKnowledgeArticleDto>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      category_id: '',
      title: '',
      content: '',
      image_url: '',
      pdf_url: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (article && isEdit) {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
      reset({
        category_id: typeof article.category_id === 'object' ? article.category_id._id : article.category_id,
        title: article.title,
        content: article.content,
        image_url: article.image_url 
          ? (() => {
              let url = article.image_url.trim();
              
              // Якщо це вже повний URL, виправляємо подвоєння /api/v1
              if (url.startsWith('http://') || url.startsWith('https://')) {
                return url.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
              }
              
              // Якщо blob URL, використовуємо як є
              if (url.startsWith('blob:')) {
                return url;
              }
              
              // Нормалізуємо baseUrl
              const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
              
              // Видаляємо /api/v1 з початку, якщо воно є і baseUrl вже містить /api/v1
              if (url.startsWith('/api/v1/')) {
                url = url.replace(/^\/api\/v1/, '');
              }
              
              // Додаємо baseUrl
              if (url.startsWith('/')) {
                return `${normalizedBaseUrl}${url}`;
              } else {
                return `${normalizedBaseUrl}/${url}`;
              }
            })()
          : '',
        pdf_url: article.pdf_url 
          ? (() => {
              let url = article.pdf_url.trim();
              
              // Якщо це вже повний URL, виправляємо подвоєння /api/v1
              if (url.startsWith('http://') || url.startsWith('https://')) {
                return url.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
              }
              
              // Якщо blob URL, використовуємо як є
              if (url.startsWith('blob:')) {
                return url;
              }
              
              // Нормалізуємо baseUrl
              const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
              
              // Видаляємо /api/v1 з початку, якщо воно є і baseUrl вже містить /api/v1
              if (url.startsWith('/api/v1/')) {
                url = url.replace(/^\/api\/v1/, '');
              }
              
              // Додаємо baseUrl
              if (url.startsWith('/')) {
                return `${normalizedBaseUrl}${url}`;
              } else {
                return `${normalizedBaseUrl}/${url}`;
              }
            })()
          : '',
        is_active: article.is_active,
      });
    }
  }, [article, isEdit, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateKnowledgeArticleDto) => knowledgeBaseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-articles'] });
      navigate('/knowledge-base');
    },
    onError: (error: any) => {
      console.error('[KnowledgeBaseArticleFormPage] Create error:', error);
      console.error('[KnowledgeBaseArticleFormPage] Error response:', error.response?.data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateKnowledgeArticleDto>) => knowledgeBaseService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-articles'] });
      navigate('/knowledge-base');
    },
    onError: (error: any) => {
      console.error('[KnowledgeBaseArticleFormPage] Update error:', error);
      console.error('[KnowledgeBaseArticleFormPage] Error response:', error.response?.data);
    },
  });

  const onSubmit = (data: CreateKnowledgeArticleDto) => {
    // Конвертуємо повні URL у відносні шляхи для бекенду
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
    const processedData = {
      ...data,
      image_url: data.image_url 
        ? (data.image_url.startsWith('http') && data.image_url.includes(baseUrl))
          ? data.image_url.replace(baseUrl, '')
          : data.image_url.startsWith('http')
          ? data.image_url
          : data.image_url
        : undefined,
      pdf_url: data.pdf_url
        ? (data.pdf_url.startsWith('http') && data.pdf_url.includes(baseUrl))
          ? data.pdf_url.replace(baseUrl, '')
          : data.pdf_url.startsWith('http')
          ? data.pdf_url
          : data.pdf_url
        : undefined,
    };

    // Видаляємо порожні рядки
    if (!processedData.image_url) {
      delete processedData.image_url;
    }
    if (!processedData.pdf_url) {
      delete processedData.pdf_url;
    }

    console.log('[KnowledgeBaseArticleFormPage] Submitting data:', processedData);

    if (isEdit) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  if (isLoadingArticle) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/knowledge-base')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Редагувати статтю' : 'Створити статтю'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Назва статті"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category_id}>
                    <InputLabel>Категорія</InputLabel>
                    <Select 
                      {...field} 
                      label="Категорія" 
                      value={field.value || ''}
                      disabled={isLoadingCategories}
                    >
                      {isLoadingCategories ? (
                        <MenuItem disabled>Завантаження категорій...</MenuItem>
                      ) : categoriesError ? (
                        <MenuItem disabled>Помилка завантаження категорій</MenuItem>
                      ) : Array.isArray(categories) && categories.length > 0 ? (
                        categories
                          .filter((category: any) => category?.is_active !== false)
                          .map((category: any) => (
                            <MenuItem key={category._id || category.id} value={category._id || category.id}>
                              {category.name || category.title || 'Без назви'}
                            </MenuItem>
                          ))
                      ) : (
                        <MenuItem disabled>
                          {categories === undefined ? 'Завантаження...' : 'Немає доступних категорій. Створіть категорію в розділі "Категорії бази знань"'}
                        </MenuItem>
                      )}
                    </Select>
                    {errors.category_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.category_id.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor
                    value={field.value}
                    onChange={field.onChange}
                    label="Контент (Markdown)"
                    error={!!errors.content}
                    helperText={errors.content?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Зображення (опційно)
              </Typography>
              <FileUpload
                type="image"
                value={watch('image_url') || ''}
                onChange={(url) => setValue('image_url', url)}
                accept="image/*"
                maxSize={10}
                label="Завантажити зображення"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                PDF файл (опційно)
              </Typography>
              <FileUpload
                type="pdf"
                value={watch('pdf_url') || ''}
                onChange={(url) => setValue('pdf_url', url)}
                accept="application/pdf"
                maxSize={50}
                label="Завантажити PDF"
              />
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            {(createMutation.isError || updateMutation.isError) && (
              <Grid item xs={12}>
                <Alert severity="error">
                  Помилка збереження статті: {
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
                <Button variant="outlined" onClick={() => navigate('/knowledge-base')}>
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

export default KnowledgeBaseArticleFormPage;

