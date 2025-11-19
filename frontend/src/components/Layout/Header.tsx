import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../../hooks/useAuth';
import { useThemeMode } from '../../contexts/ThemeContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <AppBar position="static" sx={{ boxShadow: 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Країна Мрій - Адмін панель
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleTheme} color="inherit" title={mode === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'}>
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
          <Typography variant="body2">{user?.username || 'Адміністратор'}</Typography>
          <IconButton onClick={logout} color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

