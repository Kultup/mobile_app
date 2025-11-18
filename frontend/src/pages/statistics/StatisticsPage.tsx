import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useQuery } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uk } from 'date-fns/locale';
import { adminService } from '../../services/admin.service';
import { ratingsService } from '../../services/ratings.service';
import { citiesService } from '../../services/cities.service';
import { positionsService } from '../../services/positions.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatisticsPage = () => {
  const [tab, setTab] = useState(0);
  const [ratingType, setRatingType] = useState<'global' | 'city' | 'position'>('global');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [ratingPage, setRatingPage] = useState(1);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: adminService.getDashboard,
  });

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesService.getAll(true),
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsService.getAll(true),
  });

  const { data: globalRatings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['ratings', 'global', ratingPage],
    queryFn: () => ratingsService.getGlobal({ page: ratingPage, limit: 20 }),
    enabled: tab === 1 && ratingType === 'global',
  });

  const { data: cityRatings } = useQuery({
    queryKey: ['ratings', 'city', cityFilter, ratingPage],
    queryFn: () => ratingsService.getByCity(cityFilter, { page: ratingPage, limit: 20 }),
    enabled: tab === 1 && ratingType === 'city' && !!cityFilter,
  });

  const { data: positionRatings } = useQuery({
    queryKey: ['ratings', 'position', positionFilter, ratingPage],
    queryFn: () => ratingsService.getByPosition(positionFilter, { page: ratingPage, limit: 20 }),
    enabled: tab === 1 && ratingType === 'position' && !!positionFilter,
  });

  // Mock data for charts (TODO: Replace with real API data)
  const testCompletionData = [
    { date: '01.11', completed: 45, total: 50 },
    { date: '02.11', completed: 48, total: 50 },
    { date: '03.11', completed: 50, total: 50 },
    { date: '04.11', completed: 47, total: 50 },
    { date: '05.11', completed: 49, total: 50 },
  ];

  const cityActivityData = [
    { city: 'Київ', users: 300, completion: 95 },
    { city: 'Львів', users: 200, completion: 92 },
    { city: 'Одеса', users: 150, completion: 88 },
  ];

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
        <Alert severity="error">Помилка завантаження статистики</Alert>
      </Box>
    );
  }

  const handleExportStatistics = () => {
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const url = `${baseUrl}/api/v1/admin/statistics/export`;
    
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `statistics_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((error) => {
        console.error('Error exporting statistics:', error);
        alert('Помилка експорту статистики');
      });
  };

  const ratingsData = ratingType === 'global' ? globalRatings : ratingType === 'city' ? cityRatings : positionRatings;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Статистика
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportStatistics}
        >
          Експортувати статистику
        </Button>
      </Box>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Загальна статистика" />
          <Tab label="Рейтинги" icon={<EmojiEventsIcon />} iconPosition="start" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
              <DateRangeIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                Фільтр за періодом:
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
                <DatePicker
                  label="Від"
                  value={dateFrom}
                  onChange={(newValue) => setDateFrom(newValue)}
                  slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
                />
                <DatePicker
                  label="До"
                  value={dateTo}
                  onChange={(newValue) => setDateTo(newValue)}
                  slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
                  minDate={dateFrom || undefined}
                />
                {(dateFrom || dateTo) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setDateFrom(null);
                      setDateTo(null);
                    }}
                  >
                    Скинути
                  </Button>
                )}
              </LocalizationProvider>
            </Box>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Проходження тестів (останні 5 днів)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={testCompletionData}>
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Активність по містах
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#8884d8" name="Користувачі" />
                <Bar dataKey="completion" fill="#82ca9d" name="% проходження" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Загальна статистика
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {dashboardData?.total_users || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всього користувачів
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {dashboardData?.active_today || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Активні сьогодні
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {dashboardData?.tests_completed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Тестів завершено
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {dashboardData?.completion_rate ? dashboardData.completion_rate.toFixed(1) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    % проходження
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Тип рейтингу</InputLabel>
                <Select
                  value={ratingType}
                  label="Тип рейтингу"
                  onChange={(e) => {
                    setRatingType(e.target.value as 'global' | 'city' | 'position');
                    setRatingPage(1);
                  }}
                >
                  <MenuItem value="global">Загальний</MenuItem>
                  <MenuItem value="city">За містом</MenuItem>
                  <MenuItem value="position">За посадою</MenuItem>
                </Select>
              </FormControl>

              {ratingType === 'city' && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Місто</InputLabel>
                  <Select
                    value={cityFilter}
                    label="Місто"
                    onChange={(e) => {
                      setCityFilter(e.target.value);
                      setRatingPage(1);
                    }}
                  >
                    <MenuItem value="">Виберіть місто</MenuItem>
                    {citiesData?.data.map((city) => (
                      <MenuItem key={city._id} value={city._id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {ratingType === 'position' && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Посада</InputLabel>
                  <Select
                    value={positionFilter}
                    label="Посада"
                    onChange={(e) => {
                      setPositionFilter(e.target.value);
                      setRatingPage(1);
                    }}
                  >
                    <MenuItem value="">Виберіть посаду</MenuItem>
                    {positionsData?.data.map((position) => (
                      <MenuItem key={position._id} value={position._id}>
                        {position.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={uk}>
                <DatePicker
                  label="Від"
                  value={dateFrom}
                  onChange={(newValue) => setDateFrom(newValue)}
                  slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
                />
                <DatePicker
                  label="До"
                  value={dateTo}
                  onChange={(newValue) => setDateTo(newValue)}
                  slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
                  minDate={dateFrom || undefined}
                />
                {(dateFrom || dateTo) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setDateFrom(null);
                      setDateTo(null);
                    }}
                  >
                    Скинути
                  </Button>
                )}
              </LocalizationProvider>
            </Box>

            {ratingsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : ratingsData?.data && ratingsData.data.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width={60}>Місце</TableCell>
                        <TableCell>Користувач</TableCell>
                        <TableCell>Місто</TableCell>
                        <TableCell>Посада</TableCell>
                        <TableCell align="right">Бали</TableCell>
                        <TableCell align="right">Тестів</TableCell>
                        <TableCell align="right">Streak</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ratingsData.data.map((rating) => (
                        <TableRow key={rating.user.id} hover>
                          <TableCell>
                            {rating.position <= 3 ? (
                              <Chip
                                label={rating.position}
                                color={rating.position === 1 ? 'warning' : rating.position === 2 ? 'default' : 'secondary'}
                                icon={rating.position === 1 ? <EmojiEventsIcon /> : undefined}
                              />
                            ) : (
                              rating.position
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {rating.user.full_name}
                            </Typography>
                          </TableCell>
                          <TableCell>{rating.user.city?.name || '-'}</TableCell>
                          <TableCell>{rating.user.position?.name || '-'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {rating.total_score}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{rating.tests_completed}</TableCell>
                          <TableCell align="right">
                            <Chip label={rating.current_streak} size="small" color="success" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  {ratingType === 'city' && !cityFilter
                    ? 'Виберіть місто для перегляду рейтингу'
                    : ratingType === 'position' && !positionFilter
                    ? 'Виберіть посаду для перегляду рейтингу'
                    : 'Рейтингів не знайдено'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StatisticsPage;
