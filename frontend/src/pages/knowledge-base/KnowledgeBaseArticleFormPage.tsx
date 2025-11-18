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
  image_url: yup.string().url('Невалідний URL').nullable().optional(),
  pdf_url: yup.string().url('Невалідний URL').nullable().optional(),
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

  const { data: categories } = useQuery({
    queryKey: ['knowledge-base-categories'],
    queryFn: async () => {
      const response = await categoriesService.getKnowledgeBaseCategories();
      return response.data || [];
    },
  });

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
        image_url: article.image_url?.startsWith('http') ? article.image_url : (article.image_url ? `${baseUrl}${article.image_url}` : ''),
        pdf_url: article.pdf_url?.startsWith('http') ? article.pdf_url : (article.pdf_url ? `${baseUrl}${article.pdf_url}` : ''),
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
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateKnowledgeArticleDto>) => knowledgeBaseService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-articles'] });
      navigate('/knowledge-base');
    },
  });

  const onSubmit = (data: CreateKnowledgeArticleDto) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
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
                    <Select {...field} label="Категорія">
                      {categories?.map((category: any) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
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
                type="image"
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
                  Помилка збереження статті
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

