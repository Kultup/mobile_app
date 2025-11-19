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
  TextField,
  InputAdornment,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsService, Question } from '../../services/questions.service';
import { positionsService } from '../../services/positions.service';

const QuestionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsService.getAll(true),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', page, search, activeFilter, positionFilter],
    queryFn: () =>
      questionsService.getAll({
        page,
        per_page: 20,
        search: search || undefined,
        is_active: activeFilter,
        position_id: positionFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: questionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      questionsService.toggleActive(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      console.error('Помилка перемикання активності питання:', error);
      alert(`Помилка: ${error.response?.data?.message || error.message || 'Невідома помилка'}`);
    },
  });

  const importMutation = useMutation({
    mutationFn: questionsService.importFromExcel,
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      if (result.errors.length === 0) {
        setTimeout(() => {
          setImportDialogOpen(false);
          setSelectedFile(null);
          setImportResult(null);
        }, 3000);
      }
    },
    onError: () => {
      setImportResult({ imported: 0, errors: ['Помилка імпорту файлу'] });
    },
  });

  const handleDelete = (id: string) => {
    setQuestionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteMutation.mutate(questionToDelete);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        alert('Будь ласка, виберіть файл Excel (.xlsx, .xls) або CSV');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
    setImportResult(null);
  };

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
        <Alert severity="error">Помилка завантаження питань</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Управління питаннями
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Імпортувати з Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/questions/new')}
          >
            Додати питання
          </Button>
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Пошук..."
          value={search}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Посада</InputLabel>
          <Select
            value={positionFilter}
            label="Посада"
            onChange={(e) => {
              setPositionFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Всі посади</MenuItem>
            {positionsData?.data
              ?.filter((position) => position.is_active !== false)
              .map((position) => (
                <MenuItem key={position._id} value={position._id}>
                  {position.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={activeFilter === undefined ? 'all' : activeFilter ? 'active' : 'inactive'}
            label="Статус"
            onChange={(e) => {
              const value = e.target.value;
              setActiveFilter(value === 'all' ? undefined : value === 'active');
              setPage(1);
            }}
          >
            <MenuItem value="all">Всі</MenuItem>
            <MenuItem value="active">Активні</MenuItem>
            <MenuItem value="inactive">Неактивні</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Текст питання</TableCell>
              <TableCell>Посада</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Медіа</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Питань не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((question: Question) => (
                <TableRow key={question._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {question.question_text}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {question.position_id ? (
                      <Chip
                        label={typeof question.position_id === 'object' ? question.position_id.name : question.position_id}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Без посади
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={question.question_type === 'single_choice' ? 'Один варіант' : question.question_type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {question.media_type !== 'none' && (
                      <Chip
                        label={question.media_type === 'image' ? 'Фото' : 'Відео'}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        toggleActiveMutation.mutate({
                          id: question._id,
                          is_active: !question.is_active,
                        });
                      }}
                      disabled={toggleActiveMutation.isPending}
                      color={question.is_active ? 'success' : 'default'}
                      title={question.is_active ? 'Відключити питання' : 'Увімкнути питання'}
                    >
                      {question.is_active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </IconButton>
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {question.is_active ? 'Активне' : 'Неактивне'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/questions/${question._id}/edit`)}
                      color="primary"
                      title="Редагувати питання"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(question._id)}
                      color="error"
                      title="Видалити питання"
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
            Ви впевнені, що хочете видалити це питання? Цю дію неможливо скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Імпорт питань з Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Формат файлу: Excel (.xlsx, .xls) або CSV
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Очікувані колонки: category_id, question_text, answer1, answer2, answer3, answer4, correct_answer (номер від 1 до 4)
            </Typography>

            <input
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              id="excel-file-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="excel-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                {selectedFile ? selectedFile.name : 'Виберіть файл'}
              </Button>
            </label>

            {importMutation.isPending && (
              <Box display="flex" alignItems="center" gap={2} sx={{ mt: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Імпорт у процесі...</Typography>
              </Box>
            )}

            {importResult && (
              <Box sx={{ mt: 2 }}>
                {importResult.errors.length === 0 ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Успішно імпортовано {importResult.imported} питань
                  </Alert>
                ) : (
                  <>
                    <Alert severity={importResult.imported > 0 ? 'warning' : 'error'} sx={{ mb: 2 }}>
                      Імпортовано: {importResult.imported} питань
                      {importResult.errors.length > 0 && `, помилок: ${importResult.errors.length}`}
                    </Alert>
                    {importResult.errors.length > 0 && (
                      <Box sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Помилки:
                        </Typography>
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <Typography key={index} variant="caption" display="block" color="error" sx={{ mb: 0.5 }}>
                            {error}
                          </Typography>
                        ))}
                        {importResult.errors.length > 10 && (
                          <Typography variant="caption" color="text.secondary">
                            ... та ще {importResult.errors.length - 10} помилок
                          </Typography>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>Закрити</Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!selectedFile || importMutation.isPending}
            startIcon={importMutation.isPending ? <CircularProgress size={20} /> : <UploadFileIcon />}
          >
            Імпортувати
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionsPage;
