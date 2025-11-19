import { useState } from 'react';
import {
  Typography,
  Box,
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
  IconButton,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackService, FeedbackQuestion, FeedbackErrorReport } from '../../services/feedback.service';

const FeedbackPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [questionsFilter, setQuestionsFilter] = useState<'all' | 'reviewed' | 'pending'>('all');
  const [reportsFilter, setReportsFilter] = useState<'all' | 'reviewed' | 'pending'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<FeedbackQuestion | null>(null);
  const [selectedReport, setSelectedReport] = useState<FeedbackErrorReport | null>(null);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const questionsFilterValue = questionsFilter === 'all' ? undefined : questionsFilter === 'reviewed';

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['feedback-questions', questionsPage, questionsFilterValue],
    queryFn: () =>
      feedbackService.getQuestions({
        page: questionsPage,
        per_page: 20,
        is_reviewed: questionsFilterValue,
      }),
  });

  const reportsFilterValue = reportsFilter === 'all' ? undefined : reportsFilter === 'reviewed';

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['feedback-reports', reportsPage, reportsFilterValue],
    queryFn: () =>
      feedbackService.getErrorReports({
        page: reportsPage,
        per_page: 20,
        is_reviewed: reportsFilterValue,
      }),
  });

  const markQuestionReviewedMutation = useMutation({
    mutationFn: feedbackService.markQuestionReviewed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-questions'] });
      setQuestionDialogOpen(false);
    },
  });

  const markReportReviewedMutation = useMutation({
    mutationFn: feedbackService.markErrorReportReviewed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-reports'] });
      setReportDialogOpen(false);
    },
  });

  const handleViewQuestion = (question: FeedbackQuestion) => {
    setSelectedQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleViewReport = (report: FeedbackErrorReport) => {
    setSelectedReport(report);
    setReportDialogOpen(true);
  };

  const handleMarkQuestionReviewed = () => {
    if (selectedQuestion) {
      markQuestionReviewedMutation.mutate(selectedQuestion._id);
    }
  };

  const handleMarkReportReviewed = () => {
    if (selectedReport) {
      markReportReviewedMutation.mutate(selectedReport._id);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Зворотний зв'язок
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Пропозиції питань" />
          <Tab label="Звіти про помилки" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Фільтр</InputLabel>
                <Select
                  value={questionsFilter}
                  label="Фільтр"
                  onChange={(e) => {
                    setQuestionsFilter(e.target.value as 'all' | 'reviewed' | 'pending');
                    setQuestionsPage(1);
                  }}
                >
                  <MenuItem value="all">Всі</MenuItem>
                  <MenuItem value="pending">Непереглянуті</MenuItem>
                  <MenuItem value="reviewed">Переглянуті</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {questionsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : questionsData?.data.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">Пропозицій питань не знайдено</Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Користувач</TableCell>
                        <TableCell>Текст питання</TableCell>
                        <TableCell>Категорія</TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell align="right">Дії</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questionsData?.data.map((question) => (
                        <TableRow key={question._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {question.user_id.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {question.user_id.city_id?.name || '-'} / {question.user_id.position_id?.name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 400,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {question.question_text}
                            </Typography>
                          </TableCell>
                          <TableCell>{question.category_id?.name || '-'}</TableCell>
                          <TableCell>{new Date(question.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={question.is_reviewed ? 'Переглянуто' : 'Непереглянуто'}
                              size="small"
                              color={question.is_reviewed ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleViewQuestion(question)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {questionsData && questionsData.meta.total_pages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={questionsData.meta.total_pages}
                      page={questionsPage}
                      onChange={(_, value) => setQuestionsPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Фільтр</InputLabel>
                <Select
                  value={reportsFilter}
                  label="Фільтр"
                  onChange={(e) => {
                    setReportsFilter(e.target.value as 'all' | 'reviewed' | 'pending');
                    setReportsPage(1);
                  }}
                >
                  <MenuItem value="all">Всі</MenuItem>
                  <MenuItem value="pending">Непереглянуті</MenuItem>
                  <MenuItem value="reviewed">Переглянуті</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {reportsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : reportsData?.data.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">Звітів про помилки не знайдено</Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Користувач</TableCell>
                        <TableCell>Питання</TableCell>
                        <TableCell>Опис помилки</TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell align="right">Дії</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportsData?.data.map((report) => (
                        <TableRow key={report._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {report.user_id.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.user_id.city_id?.name || '-'} / {report.user_id.position_id?.name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {report.question_id.question_text}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {report.description}
                            </Typography>
                          </TableCell>
                          <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={report.is_reviewed ? 'Переглянуто' : 'Непереглянуто'}
                              size="small"
                              color={report.is_reviewed ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleViewReport(report)} color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {reportsData && reportsData.meta.total_pages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={reportsData.meta.total_pages}
                      page={reportsPage}
                      onChange={(_, value) => setReportsPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Paper>

      {/* Question Details Dialog */}
      <Dialog open={questionDialogOpen} onClose={() => setQuestionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Деталі пропозиції питання</DialogTitle>
        <DialogContent>
          {selectedQuestion && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Користувач
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedQuestion.user_id.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedQuestion.user_id.city_id?.name || '-'} / {selectedQuestion.user_id.position_id?.name || '-'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Текст питання
                </Typography>
                <Typography variant="body1">{selectedQuestion.question_text}</Typography>
              </Box>

              {selectedQuestion.suggested_answers && selectedQuestion.suggested_answers.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Запропоновані відповіді
                  </Typography>
                  {selectedQuestion.suggested_answers.map((answer, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                      {index + 1}. {answer}
                    </Typography>
                  ))}
                </Box>
              )}

              {selectedQuestion.category_id && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Категорія
                  </Typography>
                  <Typography variant="body1">{selectedQuestion.category_id.name}</Typography>
                </Box>
              )}

              {selectedQuestion.comment && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Коментар
                  </Typography>
                  <Typography variant="body1">{selectedQuestion.comment}</Typography>
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Дата створення
                </Typography>
                <Typography variant="body1">{new Date(selectedQuestion.created_at).toLocaleString()}</Typography>
              </Box>

              {selectedQuestion.reviewed_by && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Переглянуто
                  </Typography>
                  <Typography variant="body1">{selectedQuestion.reviewed_by.username}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Закрити</Button>
          {selectedQuestion && !selectedQuestion.is_reviewed && (
            <Button
              onClick={handleMarkQuestionReviewed}
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled={markQuestionReviewedMutation.isPending}
            >
              {markQuestionReviewedMutation.isPending ? <CircularProgress size={20} /> : 'Позначити як переглянуте'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Деталі звіту про помилку</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Користувач
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedReport.user_id.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedReport.user_id.city_id?.name || '-'} / {selectedReport.user_id.position_id?.name || '-'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Питання
                </Typography>
                <Typography variant="body1">{selectedReport.question_id.question_text}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Опис помилки
                </Typography>
                <Typography variant="body1">{selectedReport.description}</Typography>
              </Box>

              {selectedReport.screenshot_url && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Скріншот
                  </Typography>
                  <Box
                    component="img"
                    src={selectedReport.screenshot_url}
                    alt="Screenshot"
                    sx={{ maxWidth: '100%', height: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}
                  />
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Дата створення
                </Typography>
                <Typography variant="body1">{new Date(selectedReport.created_at).toLocaleString()}</Typography>
              </Box>

              {selectedReport.reviewed_by && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Переглянуто
                  </Typography>
                  <Typography variant="body1">{selectedReport.reviewed_by.username}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Закрити</Button>
          {selectedReport && !selectedReport.is_reviewed && (
            <Button
              onClick={handleMarkReportReviewed}
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled={markReportReviewedMutation.isPending}
            >
              {markReportReviewedMutation.isPending ? <CircularProgress size={20} /> : 'Позначити як переглянуте'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackPage;

