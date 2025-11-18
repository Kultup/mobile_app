import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Rating,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery } from '@tanstack/react-query';
import { surveysService, SurveyResponse } from '../../services/surveys.service';

const SurveyResponsesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: survey } = useQuery({
    queryKey: ['survey', id],
    queryFn: () => surveysService.getById(id!),
    enabled: !!id,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['survey-responses', id, page],
    queryFn: () =>
      surveysService.getResponses(id!, {
        page,
        per_page: 20,
      }),
    enabled: !!id,
  });

  const handleExport = () => {
    if (!id) return;
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const url = `${baseUrl}/api/v1/admin/surveys/${id}/responses/export`;
    
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `survey_responses_${id}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((error) => {
        console.error('Error exporting responses:', error);
        alert('Помилка експорту відповідей');
      });
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
        <Alert severity="error">Помилка завантаження відповідей</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/surveys')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Відповіді на опитування
            </Typography>
            {survey && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {survey.title}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={!data || data.data.length === 0}
        >
          Експортувати в Excel
        </Button>
      </Box>

      {survey && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Тип опитування: {survey.survey_type === 'rating' ? 'Рейтинг' : survey.survey_type === 'multiple_choice' ? 'Множинний вибір' : 'Текстова відповідь'}
          </Typography>
          {survey.description && (
            <Typography variant="body2" color="text.secondary">
              {survey.description}
            </Typography>
          )}
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Користувач</TableCell>
              <TableCell>Відповідь</TableCell>
              <TableCell>Дата</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Відповідей не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((response: SurveyResponse) => (
                <TableRow key={response._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {typeof response.user_id === 'object' ? response.user_id.full_name : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {survey?.survey_type === 'rating' && response.rating !== undefined && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Rating value={response.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({response.rating}/5)
                        </Typography>
                      </Box>
                    )}
                    {survey?.survey_type === 'multiple_choice' && response.selected_options && (
                      <Box>
                        {response.selected_options.map((option, index) => (
                          <Chip
                            key={index}
                            label={option}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                    {survey?.survey_type === 'text' && response.response_text && (
                      <Typography variant="body2" sx={{ maxWidth: 400 }}>
                        {response.response_text}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(response.created_at).toLocaleString('uk-UA')}
                    </Typography>
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

      {data && data.meta.total > 0 && (
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Всього відповідей: {data.meta.total}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SurveyResponsesPage;

