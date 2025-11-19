import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-details', id],
    queryFn: () => adminService.getUserDetails(id!),
    enabled: !!id,
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
        <Alert severity="error">Помилка завантаження даних користувача</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')} sx={{ mt: 2 }}>
          Повернутися до списку
        </Button>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')}>
          Повернутися
        </Button>
        <Typography variant="h4" component="h1">
          Деталі користувача
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Основна інформація */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Основна інформація
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ПІБ
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {data.user.full_name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Місто
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {data.user.city_id?.name || '-'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Посада
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {data.user.position_id?.name || '-'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Статус
              </Typography>
              <Chip
                label={data.user.is_active ? 'Активний' : 'Неактивний'}
                color={data.user.is_active ? 'success' : 'default'}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                Дата реєстрації
              </Typography>
              <Typography variant="body1">
                {new Date(data.user.created_at).toLocaleDateString('uk-UA')}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Статистика */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Статистика
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {data.user.total_score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Загальні бали
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {data.user.points_balance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Баланс балів
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {data.statistics.total_tests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено тестів
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {data.statistics.correct_answers_percentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    % правильних відповідей
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="secondary">
                    {data.user.current_streak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Поточна серія
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h4" color="secondary">
                    {data.user.longest_streak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Найдовша серія
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Графік прогресу */}
        {data.statistics.progress_last_7_days && data.statistics.progress_last_7_days.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Прогрес за останні 7 днів
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.statistics.progress_last_7_days.map((item) => ({
                  date: new Date(item.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
                  percentage: item.correct_percentage,
                  tests: item.tests_completed,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="percentage" stroke="#8884d8" name="% правильних" />
                  <Line yAxisId="right" type="monotone" dataKey="tests" stroke="#82ca9d" name="Тестів завершено" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Останні тести */}
        {data.statistics.recent_tests && data.statistics.recent_tests.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Останні тести
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell align="right">Питання</TableCell>
                      <TableCell align="right">Правильних</TableCell>
                      <TableCell align="right">Бали</TableCell>
                      <TableCell align="right">% правильних</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.statistics.recent_tests.map((test) => {
                      const percentage = test.questions_count > 0 ? (test.correct_answers / test.questions_count) * 100 : 0;
                      return (
                        <TableRow key={test._id} hover>
                          <TableCell>
                            {new Date(test.test_date).toLocaleDateString('uk-UA')}
                          </TableCell>
                          <TableCell align="right">{test.questions_count}</TableCell>
                          <TableCell align="right">{test.correct_answers}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {test.score}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${percentage.toFixed(1)}%`}
                              size="small"
                              color={percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UserDetailsPage;

