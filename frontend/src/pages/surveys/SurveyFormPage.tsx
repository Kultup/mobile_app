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
  Chip,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveysService, CreateSurveyDto } from '../../services/surveys.service';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const schema = yup.object({
  title: yup.string().required('Назва обов\'язкова'),
  description: yup.string().optional(),
  survey_type: yup.string().oneOf(['rating', 'multiple_choice', 'text'] as const).required('Тип опитування обов\'язковий'),
  is_active: yup.boolean().optional(),
  starts_at: yup.date().nullable().optional(),
  ends_at: yup.date().nullable().optional(),
  options: yup.array().of(yup.string()).optional(),
});

const surveyTypeLabels: Record<string, string> = {
  rating: 'Рейтинг',
  multiple_choice: 'Множинний вибір',
  text: 'Текстова відповідь',
};

const SurveyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: survey, isLoading: isLoadingSurvey } = useQuery({
    queryKey: ['survey', id],
    queryFn: () => surveysService.getById(id!),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateSurveyDto & { options?: string[] }>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      survey_type: 'rating',
      is_active: true,
      starts_at: undefined,
      ends_at: undefined,
      options: [],
    },
  });

  useEffect(() => {
    if (survey && isEdit) {
      reset({
        title: survey.title,
        description: survey.description || '',
        survey_type: survey.survey_type,
        is_active: survey.is_active,
        starts_at: survey.starts_at ? new Date(survey.starts_at) : undefined,
        ends_at: survey.ends_at ? new Date(survey.ends_at) : undefined,
        options: (survey as any).options || [],
      });
    }
  }, [survey, isEdit, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSurveyDto) => surveysService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      navigate('/surveys');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateSurveyDto>) => surveysService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      navigate('/surveys');
    },
  });

  const onSubmit = (data: CreateSurveyDto & { options?: string[] }) => {
    const submitData: any = {
      title: data.title,
      description: data.description,
      survey_type: data.survey_type,
      is_active: data.is_active,
      starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : undefined,
      ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : undefined,
    };

    if (data.survey_type === 'multiple_choice' && data.options) {
      submitData.options = data.options;
    }

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const surveyType = watch('survey_type');
  const options = watch('options') || [];

  const addOption = () => {
    setValue('options', [...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setValue('options', newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setValue('options', newOptions);
  };

  if (isLoadingSurvey) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate('/surveys')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEdit ? 'Редагувати опитування' : 'Створити опитування'}
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Назва опитування"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message as string}
                    />
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
                  name="survey_type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.survey_type}>
                      <InputLabel>Тип опитування</InputLabel>
                      <Select {...field} label="Тип опитування">
                        {Object.entries(surveyTypeLabels).map(([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.survey_type && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.survey_type.message as string}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {surveyType === 'multiple_choice' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Варіанти відповідей
                  </Typography>
                  <Stack spacing={2}>
                    {options.map((option, index) => (
                      <Box key={index} display="flex" gap={2} alignItems="center">
                        <TextField
                          fullWidth
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Варіант ${index + 1}`}
                        />
                        <IconButton
                          onClick={() => removeOption(index)}
                          color="error"
                          disabled={options.length <= 2}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addOption}
                      variant="outlined"
                      size="small"
                    >
                      Додати варіант
                    </Button>
                  </Stack>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <Controller
                  name="starts_at"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Дата початку (опційно)"
                      value={field.value || null}
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.starts_at,
                          helperText: errors.starts_at?.message as string,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="ends_at"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Дата закінчення (опційно)"
                      value={field.value || null}
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.ends_at,
                          helperText: errors.ends_at?.message as string,
                        },
                      }}
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
                      label="Активне"
                    />
                  )}
                />
              </Grid>

              {(createMutation.isError || updateMutation.isError) && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    Помилка збереження опитування
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate('/surveys')}>
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
    </LocalizationProvider>
  );
};

export default SurveyFormPage;

