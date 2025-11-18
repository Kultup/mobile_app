import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CitiesManager from '../../components/CitiesManager/CitiesManager';
import PositionsManager from '../../components/PositionsManager/PositionsManager';

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState({
    daily_test_time: '12:00',
    test_deadline_time: '23:59',
    reminder_3h_before: true,
    reminder_1h_before: true,
    push_notification_text: 'Новий щоденний тест доступний!',
  });

  // TODO: Implement API calls for settings
  // const { data, isLoading } = useQuery({
  //   queryKey: ['settings'],
  //   queryFn: () => settingsService.getSettings(),
  // });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      // TODO: Implement API call
      return Promise.resolve(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Show success message
    },
  });

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(settings);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Налаштування системи
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Системні налаштування" />
          <Tab label="Міста" />
          <Tab label="Посади" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Розсилка тестів
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Час розсилки щоденних тестів"
                type="time"
                value={settings.daily_test_time}
                onChange={(e) => handleChange('daily_test_time', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Час, коли користувачі отримують push-повідомлення про новий тест"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Час дедлайну тесту"
                type="time"
                value={settings.test_deadline_time}
                onChange={(e) => handleChange('test_deadline_time', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="До якого часу можна пройти тест"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Нагадування
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Нагадування за 3 години"
                value={settings.reminder_3h_before ? 'Увімкнено' : 'Вимкнено'}
                InputProps={{ readOnly: true }}
                helperText="Нагадування за 3 години до дедлайну"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Нагадування за 1 годину"
                value={settings.reminder_1h_before ? 'Увімкнено' : 'Вимкнено'}
                InputProps={{ readOnly: true }}
                helperText="Нагадування за 1 годину до дедлайну"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Текст повідомлень
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Текст push-повідомлення"
                multiline
                rows={3}
                value={settings.push_notification_text}
                onChange={(e) => handleChange('push_notification_text', e.target.value)}
                helperText="Текст повідомлення про новий щоденний тест"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button variant="outlined" onClick={() => setSettings({
                  daily_test_time: '12:00',
                  test_deadline_time: '23:59',
                  reminder_3h_before: true,
                  reminder_1h_before: true,
                  push_notification_text: 'Новий щоденний тест доступний!',
                })}>
                  Скинути
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? <CircularProgress size={20} /> : 'Зберегти'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <CitiesManager />
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <PositionsManager />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SettingsPage;
