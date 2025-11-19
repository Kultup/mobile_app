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
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogContent as MuiDialogContent,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeBaseService, KnowledgeBaseArticle } from '../../services/knowledge-base.service';

const KnowledgeBasePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [articleToPreview, setArticleToPreview] = useState<KnowledgeBaseArticle | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['knowledge-base-articles', page, search],
    queryFn: () =>
      knowledgeBaseService.getArticles({
        page,
        per_page: 20,
        search: search || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: knowledgeBaseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-articles'] });
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    },
  });

  const handleDelete = (id: string) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePreview = (article: KnowledgeBaseArticle) => {
    setArticleToPreview(article);
    setPreviewDialogOpen(true);
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
        <Alert severity="error">Помилка завантаження статей</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          База знань
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/knowledge-base/articles/new')}
        >
          Додати статтю
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
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
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Назва</TableCell>
              <TableCell>Категорія</TableCell>
              <TableCell align="right">Перегляди</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Статей не знайдено
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((article: KnowledgeBaseArticle) => (
                <TableRow key={article._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{article.category_id?.name || '-'}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                      <VisibilityIcon fontSize="small" color="action" />
                      {article.views_count}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={article.is_active ? 'Активна' : 'Неактивна'}
                      size="small"
                      color={article.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(article)}
                      color="info"
                      title="Переглянути статтю"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/knowledge-base/articles/${article._id}/edit`)}
                      color="primary"
                      title="Редагувати статтю"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(article._id)}
                      color="error"
                      title="Видалити статтю"
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
            Ви впевнені, що хочете видалити цю статтю? Цю дію неможливо скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {articleToPreview?.title}
        </DialogTitle>
        <MuiDialogContent dividers>
          {articleToPreview && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={articleToPreview.category_id?.name || 'Без категорії'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                {articleToPreview.position_id && (
                  <Chip
                    label={`Посада: ${typeof articleToPreview.position_id === 'object' ? articleToPreview.position_id.name : articleToPreview.position_id}`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                )}
                <Chip
                  label={`Перегляди: ${articleToPreview.views_count}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              {articleToPreview.image_url && (() => {
                // Обробка image_url для коректного відображення
                let imageUrl = articleToPreview.image_url.trim();
                const originalUrl = imageUrl;
                
                // Детальне логування для діагностики
                console.log('[KnowledgeBasePage] Processing image URL:', {
                  original: originalUrl,
                  type: typeof imageUrl,
                });
                
                // Якщо це вже повний URL, виправляємо подвоєння /api/v1
                if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                  imageUrl = imageUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
                  console.log('[KnowledgeBasePage] Full URL detected, fixed:', imageUrl);
                } else if (!imageUrl.startsWith('blob:')) {
                  // Якщо це відносний шлях, конвертуємо в повний URL
                  const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';
                  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                  
                  console.log('[KnowledgeBasePage] Relative URL detected:', {
                    original: imageUrl,
                    baseUrl,
                    normalizedBaseUrl,
                  });
                  
                  // Видаляємо /api/v1 з початку, якщо воно є і baseUrl вже містить /api/v1
                  if (imageUrl.startsWith('/api/v1/')) {
                    imageUrl = imageUrl.replace(/^\/api\/v1/, '');
                    console.log('[KnowledgeBasePage] Removed /api/v1 prefix:', imageUrl);
                  }
                  
                  // Додаємо baseUrl
                  if (imageUrl.startsWith('/')) {
                    imageUrl = `${normalizedBaseUrl}${imageUrl}`;
                  } else {
                    imageUrl = `${normalizedBaseUrl}/${imageUrl}`;
                  }
                  
                  // Фінальна перевірка на подвоєння
                  imageUrl = imageUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
                  
                  console.log('[KnowledgeBasePage] Final URL:', imageUrl);
                }
                
                return (
                  <Box sx={{ mb: 2 }}>
                    <img
                      src={imageUrl}
                      alt={articleToPreview.title}
                      onError={(e) => {
                        console.error('[KnowledgeBasePage] Image load error:', {
                          finalUrl: imageUrl,
                          originalUrl: originalUrl,
                          articleImageUrl: articleToPreview.image_url,
                          error: e,
                          timestamp: new Date().toISOString(),
                        });
                        // Спробуємо завантажити через прямий запит для діагностики
                        fetch(imageUrl)
                          .then((response) => {
                            console.error('[KnowledgeBasePage] Fetch response:', {
                              status: response.status,
                              statusText: response.statusText,
                              headers: Object.fromEntries(response.headers.entries()),
                            });
                          })
                          .catch((fetchError) => {
                            console.error('[KnowledgeBasePage] Fetch error:', fetchError);
                          });
                      }}
                      onLoad={() => {
                        console.log('[KnowledgeBasePage] Image loaded successfully:', {
                          url: imageUrl,
                          original: originalUrl,
                        });
                      }}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                      }}
                    />
                  </Box>
                );
              })()}

              <Box
                sx={{
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    marginTop: '1em',
                    marginBottom: '0.5em',
                  },
                  '& p': {
                    marginBottom: '1em',
                  },
                  '& ul, & ol': {
                    marginLeft: '2em',
                    marginBottom: '1em',
                  },
                  '& code': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                  },
                  '& pre': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '1em',
                    borderRadius: '4px',
                    overflow: 'auto',
                  },
                  '& blockquote': {
                    borderLeft: '4px solid #ccc',
                    marginLeft: 0,
                    paddingLeft: '1em',
                    color: '#666',
                  },
                }}
              >
                <ReactMarkdown>{articleToPreview.content}</ReactMarkdown>
              </Box>

              {articleToPreview.pdf_url && (() => {
                // Обробка pdf_url для коректного відображення
                let pdfUrl = articleToPreview.pdf_url.trim();
                
                // Якщо це вже повний URL, виправляємо подвоєння /api/v1
                if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
                  pdfUrl = pdfUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
                } else if (!pdfUrl.startsWith('blob:')) {
                  // Якщо це відносний шлях, конвертуємо в повний URL
                  const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';
                  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                  
                  // Видаляємо /api/v1 з початку, якщо воно є і baseUrl вже містить /api/v1
                  if (pdfUrl.startsWith('/api/v1/')) {
                    pdfUrl = pdfUrl.replace(/^\/api\/v1/, '');
                  }
                  
                  // Додаємо baseUrl
                  if (pdfUrl.startsWith('/')) {
                    pdfUrl = `${normalizedBaseUrl}${pdfUrl}`;
                  } else {
                    pdfUrl = `${normalizedBaseUrl}/${pdfUrl}`;
                  }
                  
                  // Фінальна перевірка на подвоєння
                  pdfUrl = pdfUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
                }
                
                return (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<OpenInNewIcon />}
                      component="a"
                    >
                      Відкрити PDF
                    </Button>
                  </Box>
                );
              })()}
            </Box>
          )}
        </MuiDialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Закрити</Button>
          {articleToPreview && (
            <Button
              onClick={() => {
                setPreviewDialogOpen(false);
                navigate(`/knowledge-base/articles/${articleToPreview._id}/edit`);
              }}
              variant="contained"
            >
              Редагувати
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeBasePage;
