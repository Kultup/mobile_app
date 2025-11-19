import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const routeLabels: Record<string, string> = {
  dashboard: 'Дашборд',
  questions: 'Питання',
  'question-categories': 'Категорії питань',
  'knowledge-base': 'База знань',
  'knowledge-base/categories': 'Категорії бази знань',
  users: 'Користувачі',
  statistics: 'Статистика',
  surveys: 'Опитування',
  achievements: 'Ачівки',
  shop: 'Магазин',
  feedback: 'Зворотний зв\'язок',
  logs: 'Логи',
  settings: 'Налаштування',
  new: 'Створити',
  edit: 'Редагувати',
  details: 'Деталі',
  responses: 'Відповіді',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Головна
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = routeLabels[value] || value;

          return last ? (
            <Typography key={to} color="text.primary">
              {label}
            </Typography>
          ) : (
            <Link
              key={to}
              to={to}
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;

