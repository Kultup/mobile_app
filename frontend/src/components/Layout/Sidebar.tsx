import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';

const drawerWidth = 240;

const menuItems = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Питання', icon: <QuizIcon />, path: '/questions' },
  { text: 'Категорії питань', icon: <CategoryIcon />, path: '/question-categories' },
  { text: 'База знань', icon: <MenuBookIcon />, path: '/knowledge-base' },
  { text: 'Категорії бази знань', icon: <CategoryIcon />, path: '/knowledge-base/categories' },
  { text: 'Користувачі', icon: <PeopleIcon />, path: '/users' },
  { text: 'Статистика', icon: <BarChartIcon />, path: '/statistics' },
  { text: 'Опитування', icon: <AssignmentIcon />, path: '/surveys' },
  { text: 'Ачівки', icon: <EmojiEventsIcon />, path: '/achievements' },
  { text: 'Магазин', icon: <ShoppingCartIcon />, path: '/shop' },
  { text: 'Налаштування', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

