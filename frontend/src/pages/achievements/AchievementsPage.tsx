import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementsService, Achievement } from '../../services/achievements.service';
import { achievementsStatsService } from '../../services/achievements-stats.service';

const categoryLabels: Record<string, string> = {
  testing: 'Тестування',
  activity: 'Активність',
  accuracy: 'Точність',
  rating: 'Рейтинг',
  special: 'Спеціальні',
};

const conditionLabels: Record<string, string> = {
  tests_count: 'Кількість тестів',
  streak: 'Серія днів',
  perfect_tests: 'Ідеальні тести',
  rating_position: 'Позиція в рейтингу',
};

const AchievementsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [statsPage, setStatsPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['achievements', page, categoryFilter],
    queryFn: () =>
      achievementsService.getAll({
        page,
        per_page: 20,
        category: categoryFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: achievementsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setDeleteDialogOpen(false);
      setAchievementToDelete(null);
    },
  });

  const handleDelete = (id: string) => {
    setAchievementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (achievementToDelete) {
      deleteMutation.mutate(achievementToDelete);
    }
  };

  const handleViewStats = (id: string) => {
    setSelectedAchievementId(id);
    setStatsDialogOpen(true);
    setStatsPage(1);
  };

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['achievement-stats', selectedAchievementId, statsPage],
    queryFn: () => achievementsStatsService.getStatistics(selectedAchievementId!, { page: statsPage, per_page: 10 }),
    enabled: statsDialogOpen && !!selectedAchievementId,
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
        <Alert severity="error">Помилка завантаження ачівок</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Ачівки
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/achievements/new')}
        >
          Створити ачівку
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Категорія</InputLabel>
          <Select
            value={categoryFilter}
            label="Категорія"
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Всі</MenuItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>Іконка</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Опис</TableCell>
              <TableCell>Категорія</TableCell>
              <TableCell>Умова</TableCell>
              <TableCell align="right">Бали</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Ачівок не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((achievement: Achievement) => (
                <TableRow key={achievement._id} hover>
                  <TableCell>
                    <Avatar src={achievement.icon_url} sx={{ width: 40, height: 40 }}>
                      🏆
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {achievement.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {achievement.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={categoryLabels[achievement.category] || achievement.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {conditionLabels[achievement.condition_type] || achievement.condition_type}: {achievement.condition_value}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={`+${achievement.reward_points}`} size="small" color="success" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewStats(achievement._id)}
                      color="info"
                      title="Статистика"
                    >
                      <BarChartIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/achievements/${achievement._id}/edit`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(achievement._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.meta.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={data.meta.total_pages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити цю ачівку? Цю дію неможливо скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Статистика ачівки: {statsData?.achievement.name}
        </DialogTitle>
        <DialogContent>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : statsData ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {statsData.statistics.total_users}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Всього користувачів
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {statsData.statistics.completed_users}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Отримали
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="info.main">
                      {statsData.statistics.in_progress_users}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      В процесі
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">
                      {statsData.statistics.completion_rate.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      % отримання
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Користувачі з ачівкою
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Користувач</TableCell>
                      <TableCell>Місто</TableCell>
                      <TableCell>Посада</TableCell>
                      <TableCell align="right">Прогрес</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsData.users.data.map((item) => (
                      <TableRow key={item.user.id}>
                        <TableCell>{item.user.full_name}</TableCell>
                        <TableCell>{item.user.city?.name || '-'}</TableCell>
                        <TableCell>{item.user.position?.name || '-'}</TableCell>
                        <TableCell align="right">
                          {item.progress} / {statsData.achievement.condition_value}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.is_completed ? 'Отримано' : 'В процесі'}
                            size="small"
                            color={item.is_completed ? 'success' : 'info'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {statsData.users.meta.total_pages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={statsData.users.meta.total_pages}
                    page={statsPage}
                    onChange={(_, value) => setStatsPage(value)}
                    size="small"
                  />
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>Закрити</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AchievementsPage;
