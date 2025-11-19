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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsService, CreateQuestionDto } from '../../services/questions.service';
import { knowledgeBaseService } from '../../services/knowledge-base.service';
import { categoriesService } from '../../services/categories.service';
import { positionsService } from '../../services/positions.service';
import FileUpload from '../../components/FileUpload/FileUpload';
import QuestionPreview from '../../components/QuestionPreview/QuestionPreview';

const answerSchema = yup.object({
  answer_text: yup.string().required('Текст відповіді обов\'язковий'),
  is_correct: yup.boolean(),
  sort_order: yup.number(),
});

const schema = yup.object({
  category_id: yup.string().required('Категорія обов\'язкова'),
  position_id: yup.string().nullable().optional(),
  question_text: yup.string().required('Текст питання обов\'язковий'),
  question_type: yup.string().oneOf(['single_choice', 'multiple_choice', 'text'] as const).optional(),
  media_type: yup.string().oneOf(['none', 'image', 'video'] as const).optional(),
  image_url: yup.string().url('Невалідний URL').nullable().optional(),
  video_url: yup.string().url('Невалідний URL').nullable().optional(),
  video_thumbnail_url: yup.string().url('Невалідний URL').nullable().optional(),
  explanation: yup.string().nullable().optional(),
  knowledge_base_article_id: yup.string().nullable().optional(),
  answers: yup
    .array()
    .of(answerSchema)
    .min(2, 'Мінімум 2 відповіді')
    .test('has-correct', 'Повинна бути хоча б одна правильна відповідь', (answers) => {
      return answers?.some((a) => a.is_correct) || false;
    }),
  is_active: yup.boolean().optional(),
});

const QuestionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => questionsService.getById(id!),
    enabled: isEdit,
  });

  const { data: articlesData } = useQuery({
    queryKey: ['knowledge-base-articles', 'all'],
    queryFn: () => knowledgeBaseService.getAll({ page: 1, per_page: 1000 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['question-categories'],
    queryFn: () => categoriesService.getQuestionCategories(true),
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsService.getAll(true),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<any>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      category_id: '',
      position_id: '',
      question_text: '',
      question_type: 'single_choice',
      media_type: 'none',
      image_url: '',
      video_url: '',
      video_thumbnail_url: '',
      explanation: '',
      knowledge_base_article_id: '',
      is_active: true,
      answers: [
        { answer_text: '', is_correct: false, sort_order: 0 },
        { answer_text: '', is_correct: false, sort_order: 1 },
        { answer_text: '', is_correct: false, sort_order: 2 },
        { answer_text: '', is_correct: false, sort_order: 3 },
      ],
    },
  });

  const questionType = watch('question_type');
  const answers = watch('answers') || [];

  useEffect(() => {
    if (question && isEdit) {
      // Construct full URLs if they are relative
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
      const imageUrl = question.image_url 
        ? (question.image_url.startsWith('http') ? question.image_url : `${baseUrl}${question.image_url}`)
        : '';
      const videoUrl = question.video_url
        ? (question.video_url.startsWith('http') ? question.video_url : `${baseUrl}${question.video_url}`)
        : '';
      const videoThumbnailUrl = question.video_thumbnail_url
        ? (question.video_thumbnail_url.startsWith('http') ? question.video_thumbnail_url : `${baseUrl}${question.video_thumbnail_url}`)
        : '';

      reset({
        category_id: question.category_id._id,
        position_id: question.position_id?._id || '',
        question_text: question.question_text,
        question_type: question.question_type,
        media_type: question.media_type,
        image_url: imageUrl,
        video_url: videoUrl,
        video_thumbnail_url: videoThumbnailUrl,
        explanation: question.explanation || '',
        knowledge_base_article_id: question.knowledge_base_article_id?._id || '',
        answers: question.answers.map((a, idx) => ({
          answer_text: a.answer_text,
          is_correct: a.is_correct,
          sort_order: idx,
        })),
        is_active: question.is_active,
      });
    }
  }, [question, isEdit, reset]);

  const createMutation = useMutation({
    mutationFn: questionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      navigate('/questions');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateQuestionDto>) => questionsService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      navigate('/questions');
    },
  });

  const onSubmit = (data: any) => {
    // Remove empty position_id
    const submitData = { ...data };
    if (!submitData.position_id || submitData.position_id === '') {
      delete submitData.position_id;
    }

    if (isEdit) {
      updateMutation.mutate(submitData as CreateQuestionDto);
    } else {
      createMutation.mutate(submitData as CreateQuestionDto);
    }
  };

  const addAnswer = () => {
    const currentAnswers = watch('answers') || [];
    reset({
      ...watch(),
      answers: [
        ...currentAnswers,
        { answer_text: '', is_correct: false, sort_order: currentAnswers.length },
      ],
    });
  };

  const removeAnswer = (index: number) => {
    const currentAnswers = watch('answers') || [];
    if (currentAnswers.length > 2) {
      reset({
        ...watch(),
        answers: currentAnswers.filter((_: any, i: number) => i !== index),
      });
    }
  };

  if (isLoading && isEdit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/questions')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Редагувати питання' : 'Створити питання'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category_id}>
                    <InputLabel>Категорія *</InputLabel>
                    <Select {...field} label="Категорія *" value={field.value || ''}>
                      <MenuItem value="">Виберіть категорію</MenuItem>
                      {categoriesData?.data
                        ?.filter((category) => category.is_active !== false)
                        .map((category) => (
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

            <Grid item xs={12} md={6}>
              <Controller
                name="position_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.position_id}>
                    <InputLabel>Посада (опційно)</InputLabel>
                    <Select {...field} label="Посада (опційно)" value={field.value || ''}>
                      <MenuItem value="">Без прив'язки до посади</MenuItem>
                      {positionsData?.data
                        ?.filter((position) => position.is_active !== false)
                        .map((position) => (
                          <MenuItem key={position._id} value={position._id}>
                            {position.name}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.position_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.position_id.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="question_text"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Текст питання"
                    multiline
                    rows={3}
                    error={!!errors.question_text}
                    helperText={errors.question_text?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="question_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Тип питання</InputLabel>
                    <Select {...field} label="Тип питання">
                      <MenuItem value="single_choice">Один правильний варіант</MenuItem>
                      <MenuItem value="multiple_choice">Кілька правильних варіантів</MenuItem>
                      <MenuItem value="text">Текстова відповідь</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="media_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Тип медіа</InputLabel>
                    <Select {...field} label="Тип медіа">
                      <MenuItem value="none">Без медіа</MenuItem>
                      <MenuItem value="image">Фото</MenuItem>
                      <MenuItem value="video">Відео</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {watch('media_type') === 'image' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Зображення
                </Typography>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <FileUpload
                        type="image"
                        value={field.value}
                        onChange={(url) => {
                          field.onChange(url);
                        }}
                        accept="image/jpeg,image/jpg,image/png"
                        maxSize={10}
                        label="Завантажити зображення"
                        folderType="questions"
                      />
                      {field.value && (
                        <TextField
                          fullWidth
                          label="URL зображення"
                          value={field.value}
                          onChange={field.onChange}
                          margin="normal"
                          size="small"
                          helperText="Або введіть URL вручну"
                        />
                      )}
                    </Box>
                  )}
                />
              </Grid>
            )}

            {watch('media_type') === 'video' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Відео
                  </Typography>
                  <Controller
                    name="video_url"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <FileUpload
                          type="video"
                          value={field.value}
                          onChange={(url) => {
                            field.onChange(url);
                          }}
                          onThumbnailChange={(thumbnailUrl) => {
                            if (thumbnailUrl) {
                              setValue('video_thumbnail_url', thumbnailUrl);
                            }
                          }}
                          accept="video/mp4,video/mov,video/quicktime"
                          maxSize={50}
                          label="Завантажити відео"
                          folderType="questions"
                        />
                        {field.value && (
                          <TextField
                            fullWidth
                            label="URL відео"
                            value={field.value}
                            onChange={field.onChange}
                            margin="normal"
                            size="small"
                            helperText="Або введіть URL вручну"
                          />
                        )}
                      </Box>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="video_thumbnail_url"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="URL прев'ю відео"
                        error={!!errors.video_thumbnail_url}
                        helperText={(errors.video_thumbnail_url?.message as string) || 'Прев\'ю буде згенеровано автоматично після завантаження'}
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Controller
                name="explanation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Пояснення"
                    multiline
                    rows={2}
                    error={!!errors.explanation}
                    helperText={errors.explanation?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="knowledge_base_article_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Стаття бази знань (опційно)</InputLabel>
                    <Select {...field} label="Стаття бази знань (опційно)" value={field.value || ''}>
                      <MenuItem value="">Без статті</MenuItem>
                      {articlesData?.data
                        .filter((article) => article.is_active !== false)
                        .map((article) => (
                          <MenuItem key={article._id} value={article._id}>
                            {article.title}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {questionType !== 'text' && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Відповіді</Typography>
                  <Button startIcon={<AddIcon />} onClick={addAnswer} size="small">
                    Додати відповідь
                  </Button>
                </Box>
                {answers.map((_: any, index: number) => (
                  <Box key={index} display="flex" gap={2} mb={2} alignItems="flex-start">
                    <Controller
                      name={`answers.${index}.answer_text`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={`Відповідь ${index + 1}`}
                          error={!!(errors.answers as any)?.[index]?.answer_text}
                          helperText={((errors.answers as any)?.[index]?.answer_text?.message as string) || ''}
                        />
                      )}
                    />
                    <Controller
                      name={`answers.${index}.is_correct`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch {...field} checked={field.value} />}
                          label="Правильна"
                        />
                      )}
                    />
                    {answers.length > 2 && (
                      <IconButton onClick={() => removeAnswer(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {errors.answers && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {(errors.answers as any).message as string}
                  </Alert>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Активне питання"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/questions')}>
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
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

      {/* Preview питання */}
      {(watch('question_text') || watch('image_url') || watch('video_url')) && (
        <QuestionPreview
          question={{
            _id: id || '',
            question_text: watch('question_text') || 'Прев\'ю буде згенеровано автоматично після завантаження',
            question_type: watch('question_type') || 'single_choice',
            media_type: watch('media_type') || 'none',
            image_url: watch('image_url') || '',
            video_url: watch('video_url') || '',
            video_thumbnail_url: watch('video_thumbnail_url') || '',
            explanation: watch('explanation') || '',
            knowledge_base_article_id: watch('knowledge_base_article_id')
              ? { _id: watch('knowledge_base_article_id'), title: '' }
              : undefined,
            answers: watch('answers') || [],
            category_id: { _id: '', name: '' },
            is_active: true,
            created_at: '',
            updated_at: '',
          }}
        />
      )}
    </Box>
  );
};

export default QuestionFormPage;
