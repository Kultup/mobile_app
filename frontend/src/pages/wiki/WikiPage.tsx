import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-tabpanel-${index}`}
      aria-labelledby={`role-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WikiPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const permissions = [
    {
      category: 'Управління користувачами',
      items: [
        { name: 'Перегляд списку користувачів', super: true, training: true, viewer: true },
        { name: 'Перегляд деталей користувача', super: true, training: true, viewer: true },
        { name: 'Редагування користувачів', super: true, training: true, viewer: false },
        { name: 'Деактивація/видалення користувачів', super: true, training: false, viewer: false },
        { name: 'Експорт історії тестів', super: true, training: true, viewer: false },
      ],
    },
    {
      category: 'Управління адміністраторами',
      items: [
        { name: 'Перегляд списку адміністраторів', super: true, training: false, viewer: false },
        { name: 'Створення адміністраторів', super: true, training: false, viewer: false },
        { name: 'Редагування адміністраторів', super: true, training: false, viewer: false },
        { name: 'Деактивація адміністраторів', super: true, training: false, viewer: false },
      ],
    },
    {
      category: 'Управління питаннями',
      items: [
        { name: 'Перегляд списку питань', super: true, training: true, viewer: true },
        { name: 'Створення питань', super: true, training: true, viewer: false },
        { name: 'Редагування питань', super: true, training: true, viewer: false },
        { name: 'Видалення питань', super: true, training: true, viewer: false },
        { name: 'Імпорт питань з Excel', super: true, training: true, viewer: false },
        { name: 'Управління категоріями питань', super: true, training: true, viewer: false },
      ],
    },
    {
      category: 'База знань',
      items: [
        { name: 'Перегляд статей', super: true, training: true, viewer: true },
        { name: 'Створення статей', super: true, training: true, viewer: false },
        { name: 'Редагування статей', super: true, training: true, viewer: false },
        { name: 'Видалення статей', super: true, training: true, viewer: false },
        { name: 'Управління категоріями бази знань', super: true, training: true, viewer: false },
      ],
    },
    {
      category: 'Опитування',
      items: [
        { name: 'Перегляд опитувань', super: true, training: true, viewer: true },
        { name: 'Створення опитувань', super: true, training: true, viewer: false },
        { name: 'Редагування опитувань', super: true, training: true, viewer: false },
        { name: 'Видалення опитувань', super: true, training: true, viewer: false },
        { name: 'Перегляд відповідей', super: true, training: true, viewer: true },
        { name: 'Експорт відповідей у Excel', super: true, training: true, viewer: false },
      ],
    },
    {
      category: 'Ачівки',
      items: [
        { name: 'Перегляд ачівок', super: true, training: true, viewer: true },
        { name: 'Створення ачівок', super: true, training: true, viewer: false },
        { name: 'Редагування ачівок', super: true, training: true, viewer: false },
        { name: 'Видалення ачівок', super: true, training: true, viewer: false },
        { name: 'Перегляд статистики ачівок', super: true, training: true, viewer: true },
      ],
    },
    {
      category: 'Магазин',
      items: [
        { name: 'Перегляд товарів', super: true, training: true, viewer: true },
        { name: 'Створення товарів', super: true, training: true, viewer: false },
        { name: 'Редагування товарів', super: true, training: true, viewer: false },
        { name: 'Видалення товарів', super: true, training: true, viewer: false },
        { name: 'Управління категоріями товарів', super: true, training: true, viewer: false },
        { name: 'Управління типами товарів', super: true, training: true, viewer: false },
        { name: 'Перегляд статистики покупок', super: true, training: true, viewer: true },
      ],
    },
    {
      category: 'Довідники',
      items: [
        { name: 'Перегляд міст', super: true, training: true, viewer: true },
        { name: 'Управління містами', super: true, training: true, viewer: false },
        { name: 'Перегляд посад', super: true, training: true, viewer: true },
        { name: 'Створення/редагування посад', super: true, training: true, viewer: false },
        { name: 'Видалення посад', super: true, training: false, viewer: false },
      ],
    },
    {
      category: 'Налаштування системи',
      items: [
        { name: 'Перегляд налаштувань', super: true, training: true, viewer: true },
        { name: 'Оновлення налаштувань', super: true, training: true, viewer: false },
      ],
    },
    {
      category: 'Статистика та звіти',
      items: [
        { name: 'Перегляд дашборду', super: true, training: true, viewer: true },
        { name: 'Перегляд статистики', super: true, training: true, viewer: true },
        { name: 'Експорт статистики у Excel', super: true, training: true, viewer: false },
        { name: 'Перегляд рейтингів', super: true, training: true, viewer: true },
        { name: 'Перегляд логів активності', super: true, training: true, viewer: true },
      ],
    },
    {
      category: 'Зворотний зв\'язок',
      items: [
        { name: 'Перегляд пропозицій питань', super: true, training: true, viewer: true },
        { name: 'Перегляд звітів про помилки', super: true, training: true, viewer: true },
        { name: 'Позначення як переглянуте', super: true, training: true, viewer: false },
      ],
    },
    {
      category: 'Файли',
      items: [
        { name: 'Завантаження зображень', super: true, training: true, viewer: false },
        { name: 'Завантаження відео', super: true, training: true, viewer: false },
        { name: 'Перегляд файлів', super: true, training: true, viewer: true },
      ],
    },
  ];

  const renderPermissionIcon = (hasAccess: boolean) => {
    return hasAccess ? (
      <CheckCircleIcon color="success" fontSize="small" />
    ) : (
      <CancelIcon color="error" fontSize="small" />
    );
  };

  const renderRoleCard = (role: 'super' | 'training' | 'viewer') => {
    const roleInfo = {
      super: {
        title: 'Super Admin',
        subtitle: 'Супер-адміністратор',
        description: 'Повний доступ до всіх функцій системи. Може управляти адміністраторами, видаляти користувачів та посади, має повний доступ до всіх налаштувань.',
        icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />,
        color: 'error' as const,
      },
      training: {
        title: 'Training Admin',
        subtitle: 'Адміністратор навчання',
        description: 'Управління навчальним контентом (питання, статті, опитування, ачівки, магазин). Може редагувати користувачів, але не видаляти. Не може управляти адміністраторами.',
        icon: <SchoolIcon sx={{ fontSize: 40 }} />,
        color: 'warning' as const,
      },
      viewer: {
        title: 'Viewer',
        subtitle: 'Переглядач',
        description: 'Тільки перегляд даних без можливості редагування. Може переглядати статистику та звіти, але не може створювати, редагувати або видаляти.',
        icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
        color: 'success' as const,
      },
    };

    const info = roleInfo[role];

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box sx={{ color: `${info.color}.main` }}>{info.icon}</Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {info.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {info.subtitle}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            {info.description}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Довідник по ролях та правах доступу
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Ця сторінка містить детальну інформацію про права доступу кожної ролі в системі.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          {renderRoleCard('super')}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRoleCard('training')}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRoleCard('viewer')}
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Super Admin" icon={<AdminPanelSettingsIcon />} iconPosition="start" />
          <Tab label="Training Admin" icon={<SchoolIcon />} iconPosition="start" />
          <Tab label="Viewer" icon={<VisibilityIcon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="error.main">
              Super Admin - Повний доступ
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Супер-адміністратор має повний контроль над системою. Може управляти адміністраторами, видаляти користувачів та посади, має повний доступ до всіх налаштувань.
            </Typography>

            {permissions.map((category) => (
              <Accordion key={category.category} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight={600}>
                    {category.category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Право доступу</TableCell>
                          <TableCell align="center">Доступ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="center">
                              {renderPermissionIcon(item.super)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="warning.main">
              Training Admin - Управління навчальним контентом
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Адміністратор навчання має доступ до управління навчальним контентом (питання, статті, опитування, ачівки, магазин). Може редагувати користувачів, але не видаляти. Не може управляти адміністраторами.
            </Typography>

            {permissions.map((category) => (
              <Accordion key={category.category} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight={600}>
                    {category.category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Право доступу</TableCell>
                          <TableCell align="center">Доступ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="center">
                              {renderPermissionIcon(item.training)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="success.main">
              Viewer - Тільки перегляд
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Переглядач має доступ тільки до перегляду даних без можливості редагування. Може переглядати статистику та звіти, але не може створювати, редагувати або видаляти.
            </Typography>

            {permissions.map((category) => (
              <Accordion key={category.category} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight={600}>
                    {category.category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Право доступу</TableCell>
                          <TableCell align="center">Доступ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="center">
                              {renderPermissionIcon(item.viewer)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>
      </Paper>

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Рекомендації по використанню
        </Typography>
        <Box component="ul" sx={{ pl: 3, m: 0 }}>
          <li>
            <strong>Super Admin</strong> — призначати тільки головному адміністратору системи
          </li>
          <li>
            <strong>Training Admin</strong> — призначати адміністраторам, які відповідають за наповнення контентом
          </li>
          <li>
            <strong>Viewer</strong> — призначати для перегляду статистики та моніторингу без можливості внесення змін
          </li>
        </Box>
      </Paper>
    </Box>
  );
};

export default WikiPage;

