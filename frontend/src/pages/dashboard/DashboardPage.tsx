import {
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ActivityHeatmap from '../../components/ActivityHeatmap/ActivityHeatmap';

const actionTypeLabels: Record<string, string> = {
  create: 'Створення',
  update: 'Оновлення',
  delete: 'Видалення',
  view: 'Перегляд',
  export: 'Експорт',
  login: 'Вхід',
  logout: 'Вихід',
};

const DashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: adminService.getDashboard,
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
        <Alert severity="error">Помилка завантаження даних</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Дашборд
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Всього користувачів
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
              {data?.total_users || 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Активні сьогодні
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold', color: 'info.main' }}>
              {data?.active_today || 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Тести завершені
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold', color: 'success.main' }}>
              {data?.tests_completed || 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              % проходження
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold', color: 'warning.main' }}>
              {data?.completion_rate ? data.completion_rate.toFixed(1) : 0}%
            </Typography>
          </Paper>
        </Grid>

        {/* Activity Chart */}
        {data?.activity_last_7_days && data.activity_last_7_days.length > 0 && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Активність за останні 7 днів
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.activity_last_7_days.map((item) => ({
                  date: new Date(item.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
                  completed: item.completed,
                  total: item.total,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" name="Завершено" />
                  <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Всього" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Top Cities */}
        {data?.top_cities && data.top_cities.length > 0 && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Топ міст
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Місто</TableCell>
                      <TableCell align="right">Користувачі</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.top_cities.map((city, index) => (
                      <TableRow key={city.city_id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {index + 1}. {city.city_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {city.userCount}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {/* Top Positions */}
        {data?.top_positions && data.top_positions.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Топ посад
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.top_positions.map((pos) => ({
                  name: pos.position_name,
                  users: pos.userCount,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" name="Користувачі" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Activity Heatmap */}
        {data?.heatmap_data && data.heatmap_data.length > 0 && (
          <Grid item xs={12}>
            <ActivityHeatmap data={data.heatmap_data} />
          </Grid>
        )}

        {/* Recent Activity */}
        {data?.recent_activity && data.recent_activity.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Останні події
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Адміністратор</TableCell>
                      <TableCell>Дія</TableCell>
                      <TableCell>Сутність</TableCell>
                      <TableCell>Опис</TableCell>
                      <TableCell>Дата</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recent_activity.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>{activity.admin_user}</TableCell>
                        <TableCell>
                          <Chip
                            label={actionTypeLabels[activity.action] || activity.action}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{activity.entity_type}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {activity.description}
                        </TableCell>
                        <TableCell>
                          {new Date(activity.created_at).toLocaleString('uk-UA')}
                        </TableCell>
                      </TableRow>
                    ))}
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

export default DashboardPage;

