import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Radio, RadioGroup, FormControlLabel, FormControl, Chip } from '@mui/material';
import { Question } from '../../services/questions.service';

interface QuestionPreviewProps {
  question: Question;
}

const QuestionPreview = ({ question }: QuestionPreviewProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Нормалізація URL для зображення
  useEffect(() => {
    if (question.image_url && question.media_type === 'image') {
      let url = question.image_url.trim();
      
      // Якщо це вже повний URL, виправляємо подвоєння /api/v1
      if (url.startsWith('http://') || url.startsWith('https://')) {
        url = url.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
        setImageUrl(url);
        return;
      }
      
      if (url.startsWith('blob:')) {
        setImageUrl(url);
        return;
      }
      
      // Нормалізуємо відносний шлях
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      if (url.startsWith('/api/v1/')) {
        url = url.replace(/^\/api\/v1/, '');
      }
      
      if (url.startsWith('/')) {
        url = `${normalizedBaseUrl}${url}`;
      } else {
        url = `${normalizedBaseUrl}/${url}`;
      }
      
      url = url.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
      setImageUrl(url);
    } else {
      setImageUrl('');
    }
  }, [question.image_url, question.media_type]);

  // Нормалізація URL для відео
  useEffect(() => {
    if (question.video_url && question.media_type === 'video') {
      let url = question.video_url.trim();
      
      // Якщо це вже повний URL, виправляємо подвоєння /api/v1
      if (url.startsWith('http://') || url.startsWith('https://')) {
        url = url.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
        setVideoUrl(url);
        return;
      }
      
      if (url.startsWith('blob:')) {
        setVideoUrl(url);
        return;
      }
      
      // Нормалізуємо відносний шлях
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      
      if (url.startsWith('/api/v1/')) {
        url = url.replace(/^\/api\/v1/, '');
      }
      
      if (url.startsWith('/')) {
        url = `${normalizedBaseUrl}${url}`;
      } else {
        url = `${normalizedBaseUrl}/${url}`;
      }
      
      url = url.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
      setVideoUrl(url);
    } else {
      setVideoUrl('');
    }
  }, [question.video_url, question.media_type]);

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Preview питання
      </Typography>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#fafafa' }}>
        {/* Медіа */}
        {question.media_type === 'image' && imageUrl && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img
              src={imageUrl}
              alt="Question media"
              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
              onError={(e) => {
                console.error('[QuestionPreview] Image load error:', {
                  url: imageUrl,
                  originalUrl: question.image_url,
                  error: e,
                });
              }}
              onLoad={() => {
                if ((import.meta as any).env?.DEV) {
                  console.log('[QuestionPreview] Image loaded successfully:', imageUrl);
                }
              }}
              crossOrigin="anonymous"
            />
          </Box>
        )}

        {question.media_type === 'video' && videoUrl && (
          <Box sx={{ mb: 2 }}>
            <video
              src={videoUrl}
              controls
              preload="metadata"
              style={{ width: '100%', maxHeight: 300, borderRadius: 8 }}
              onError={(e) => {
                console.error('[QuestionPreview] Video load error:', {
                  url: videoUrl,
                  originalUrl: question.video_url,
                  error: e,
                  videoElement: e.target,
                });
              }}
              onLoadStart={() => {
                if ((import.meta as any).env?.DEV) {
                  console.log('[QuestionPreview] Video loading started:', videoUrl);
                }
              }}
              onLoadedMetadata={() => {
                if ((import.meta as any).env?.DEV) {
                  console.log('[QuestionPreview] Video metadata loaded:', videoUrl);
                }
              }}
              crossOrigin="anonymous"
            />
          </Box>
        )}

        {/* Текст питання */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {question.question_text}
        </Typography>

        {/* Відповіді */}
        {question.question_type !== 'text' && question.answers && (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup>
              {question.answers.map((answer, index) => (
                <FormControlLabel
                  key={index}
                  value={answer.answer_text}
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{answer.answer_text}</Typography>
                      {answer.is_correct && (
                        <Chip label="Правильна" size="small" color="success" />
                      )}
                    </Box>
                  }
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: answer.is_correct ? '#e8f5e9' : 'transparent',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {/* Пояснення */}
        {question.explanation && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Пояснення:
            </Typography>
            <Typography variant="body2">{question.explanation}</Typography>
          </Box>
        )}

        {/* Посилання на статтю */}
        {question.knowledge_base_article_id && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Детальніше в базі знань"
              color="info"
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default QuestionPreview;

