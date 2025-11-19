import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box,
  Collapse,
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
import FeedbackIcon from '@mui/icons-material/Feedback';
import HistoryIcon from '@mui/icons-material/History';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState } from 'react';

const drawerWidth = 260;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  exact?: boolean; // Якщо true, то точне співпадіння шляху
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard', exact: true },
  {
    text: 'Питання',
    icon: <QuizIcon />,
    path: '/questions',
    children: [
      { text: 'Всі питання', icon: <QuizIcon />, path: '/questions', exact: true },
      { text: 'Категорії питань', icon: <CategoryIcon />, path: '/question-categories' },
    ],
  },
  {
    text: 'База знань',
    icon: <MenuBookIcon />,
    path: '/knowledge-base',
    children: [
      { text: 'Всі статті', icon: <MenuBookIcon />, path: '/knowledge-base', exact: true },
      { text: 'Категорії бази знань', icon: <CategoryIcon />, path: '/knowledge-base/categories' },
    ],
  },
  { text: 'Користувачі', icon: <PeopleIcon />, path: '/users' },
  { text: 'Статистика', icon: <BarChartIcon />, path: '/statistics', exact: true },
  { text: 'Опитування', icon: <AssignmentIcon />, path: '/surveys' },
  { text: 'Ачівки', icon: <EmojiEventsIcon />, path: '/achievements' },
  {
    text: 'Магазин',
    icon: <ShoppingCartIcon />,
    path: '/shop',
    children: [
      { text: 'Всі товари', icon: <ShoppingCartIcon />, path: '/shop', exact: true },
      { text: 'Категорії магазину', icon: <CategoryIcon />, path: '/shop/categories' },
    ],
  },
  { text: 'Зворотний зв\'язок', icon: <FeedbackIcon />, path: '/feedback', exact: true },
  { text: 'Логи', icon: <HistoryIcon />, path: '/logs', exact: true },
  { text: 'Налаштування', icon: <SettingsIcon />, path: '/settings', exact: true },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Визначаємо, чи активний пункт меню
  const isActive = (item: MenuItem): boolean => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  // Визначаємо, чи має бути розгорнутий пункт меню
  const shouldBeExpanded = (item: MenuItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child)) || expandedItems.has(item.path);
  };

  const handleToggle = (itemPath: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemPath)) {
      newExpanded.delete(itemPath);
    } else {
      newExpanded.add(itemPath);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      handleToggle(item.path);
    } else {
      navigate(item.path);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const active = isActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const expanded = shouldBeExpanded(item);

    return (
      <Box key={item.path}>
        <ListItem disablePadding>
          <ListItemButton
            selected={active && !hasChildren}
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + level * 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 0,
                height: 2,
                backgroundColor: 'primary.main',
                transition: 'width 0.3s ease',
              },
              '&:hover::after': {
                width: '100%',
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&::after': {
                  width: '100%',
                  backgroundColor: 'primary.contrastText',
                },
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: active && !hasChildren ? 'inherit' : undefined,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: level > 0 ? '0.875rem' : '0.9375rem',
                fontWeight: active && !hasChildren ? 600 : 400,
              }}
            />
            {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  // Групуємо пункти меню
  const mainItems = menuItems.filter((item) => 
    !['Зворотний зв\'язок', 'Логи', 'Налаштування'].includes(item.text)
  );
  const systemItems = menuItems.filter((item) =>
    ['Зворотний зв\'язок', 'Логи', 'Налаштування'].includes(item.text)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: '64px !important',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Адмін панель
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List disablePadding>
          {mainItems.map((item) => renderMenuItem(item))}
        </List>
        <Divider sx={{ my: 1 }} />
        <List disablePadding>
          {systemItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
