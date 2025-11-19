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
import { achievementsService, CreateAchievementDto } from '../../services/achievements.service';
import FileUpload from '../../components/FileUpload/FileUpload';

const schema = yup.object({
  name: yup.string().required('Назва обов\'язкова'),
  description: yup.string().required('Опис обов\'язковий'),
  icon_url: yup.string().required('Іконка обов\'язкова'),
  category: yup.string().oneOf(['testing', 'activity', 'accuracy', 'rating', 'special'] as const).required('Категорія обов\'язкова'),
  condition_type: yup.string().oneOf([
    'tests_count',
    'streak',
    'perfect_tests',
    'rating_position',
    'total_points',
    'correct_answers_count',
    'average_score',
    'consecutive_perfect_tests',
    'longest_streak',
    'shop_purchases_count',
    'total_correct_answers',
    'accuracy_percentage',
  ] as const).required('Тип умови обов\'язковий'),
  condition_value: yup.number().required('Значення умови обов\'язкове').min(1, 'Значення має бути більше 0'),
  reward_points: yup.number().min(0, 'Бали не можуть бути від\'ємними').optional(),
  is_active: yup.boolean().optional(),
  sort_order: yup.number().optional(),
});

const categoryLabels: Record<string, string> = {
  testing: 'Тестування',
  activity: 'Активність',
  accuracy: 'Точність',
  rating: 'Рейтинг',
  special: 'Спеціальні',
};

const conditionLabels: Record<string, string> = {
  tests_count: 'Кількість тестів',
  streak: 'Серія днів (поточна)',
  longest_streak: 'Найдовша серія днів',
  perfect_tests: 'Ідеальні тести (5/5)',
  consecutive_perfect_tests: 'Послідовні ідеальні тести',
  rating_position: 'Позиція в рейтингу (≤)',
  total_points: 'Загальна кількість балів',
  correct_answers_count: 'Кількість правильних відповідей',
  total_correct_answers: 'Загальна кількість правильних відповідей',
  average_score: 'Середній бал (≥)',
  accuracy_percentage: 'Відсоток правильності (≥)',
  shop_purchases_count: 'Кількість покупок',
};

const AchievementFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: achievement, isLoading: isLoadingAchievement } = useQuery({
    queryKey: ['achievement', id],
    queryFn: () => achievementsService.getById(id!),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateAchievementDto>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      description: '',
      icon_url: '',
      category: 'testing',
      condition_type: 'tests_count',
      condition_value: 1,
      reward_points: 0,
      is_active: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (achievement && isEdit) {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
      reset({
        name: achievement.name,
        description: achievement.description,
        icon_url: achievement.icon_url?.startsWith('http') ? achievement.icon_url : `${baseUrl}${achievement.icon_url}`,
        category: achievement.category,
        condition_type: achievement.condition_type,
        condition_value: achievement.condition_value,
        reward_points: achievement.reward_points,
        is_active: achievement.is_active,
        sort_order: achievement.sort_order,
      });
    }
  }, [achievement, isEdit, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateAchievementDto) => achievementsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      navigate('/achievements');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateAchievementDto>) => achievementsService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      navigate('/achievements');
    },
  });

  const onSubmit = (data: CreateAchievementDto) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const iconUrl = watch('icon_url');

  if (isLoadingAchievement) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/achievements')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Редагувати ачівку' : 'Створити ачівку'}
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
                    label="Назва ачівки"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message as string}
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
                    <Select {...field} label="Категорія">
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
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

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Іконка
              </Typography>
              <FileUpload
                type="image"
                value={iconUrl}
                onChange={(url) => setValue('icon_url', url)}
                accept="image/*"
                maxSize={5}
                label="Завантажити іконку"
              />
              {errors.icon_url && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.icon_url.message as string}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="condition_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.condition_type}>
                    <InputLabel>Тип умови</InputLabel>
                    <Select {...field} label="Тип умови">
                      {Object.entries(conditionLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.condition_type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.condition_type.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="condition_value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Значення умови"
                    type="number"
                    fullWidth
                    error={!!errors.condition_value}
                    helperText={errors.condition_value?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="reward_points"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Нагорода в балах"
                    type="number"
                    fullWidth
                    error={!!errors.reward_points}
                    helperText={errors.reward_points?.message as string}
                  />
                )}
              />
            </Grid>

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
                    label="Активна"
                  />
                )}
              />
            </Grid>

            {(createMutation.isError || updateMutation.isError) && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {createMutation.error || updateMutation.error
                    ? 'Помилка збереження ачівки'
                    : 'Помилка збереження ачівки'}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/achievements')}>
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

export default AchievementFormPage;

