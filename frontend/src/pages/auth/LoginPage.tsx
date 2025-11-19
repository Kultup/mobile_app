import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const STORAGE_KEY_USERNAME = 'admin_remembered_username';
const STORAGE_KEY_PASSWORD = 'admin_remembered_password';
const STORAGE_KEY_REMEMBER = 'admin_remember_me';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Завантажити збережені дані при завантаженні сторінки
  useEffect(() => {
    const remembered = localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true';
    if (remembered) {
      const savedUsername = localStorage.getItem(STORAGE_KEY_USERNAME) || '';
      const savedPassword = localStorage.getItem(STORAGE_KEY_PASSWORD) || '';
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      
      // Зберегти дані, якщо обрано "Запам'ятати пароль"
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY_REMEMBER, 'true');
        localStorage.setItem(STORAGE_KEY_USERNAME, username);
        localStorage.setItem(STORAGE_KEY_PASSWORD, password);
      } else {
        // Видалити збережені дані, якщо checkbox не відмічений
        localStorage.removeItem(STORAGE_KEY_REMEMBER);
        localStorage.removeItem(STORAGE_KEY_USERNAME);
        localStorage.removeItem(STORAGE_KEY_PASSWORD);
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      // Детальна обробка помилок
      let errorMessage = 'Помилка входу';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          errorMessage = 'Невірний логін або пароль. Перевірте правильність введених даних.';
        } else if (status === 403) {
          errorMessage = 'Доступ заборонено. Зверніться до адміністратора.';
        } else if (status === 429) {
          errorMessage = 'Забагато спроб входу. Спробуйте пізніше.';
        } else if (status >= 500) {
          errorMessage = 'Помилка сервера. Спробуйте пізніше або зверніться до адміністратора.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Помилка ${status}. Спробуйте ще раз.`;
        }
      } else if (err.message) {
        if (err.message.includes('Network Error') || err.message.includes('timeout')) {
          errorMessage = 'Помилка з\'єднання з сервером. Перевірте інтернет-з\'єднання.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Вхід в адмін-панель
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Країна Мрій
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Логін"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              autoFocus
              disabled={isSubmitting}
              error={!!error && !username}
              helperText={error && !username ? 'Введіть логін' : ''}
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={isSubmitting}
              error={!!error && !password}
              helperText={error && !password ? 'Введіть пароль' : ''}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label="Запам'ятати пароль"
              sx={{ mt: 1 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isSubmitting || !username || !password}
            >
              {isSubmitting ? 'Вхід...' : 'Увійти'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;

