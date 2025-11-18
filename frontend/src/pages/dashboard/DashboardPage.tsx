import { Typography, Grid, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';

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
      </Grid>
    </Box>
  );
};

export default DashboardPage;

