import { useState, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Typography, 
  IconButton, 
  Tooltip,
  Divider,
  ButtonGroup
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { TextField } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
}) => {
  const [tab, setTab] = useState(0);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  // Функція для вставки тексту на позицію курсора
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textFieldRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    // Якщо є виділений текст, обгортаємо його
    const textToInsert = selectedText || placeholder;
    const newValue = textBefore + before + textToInsert + after + textAfter;
    
    onChange(newValue);

    // Встановлюємо позицію курсора після вставки
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length + after.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Функції для різних типів форматування
  const insertBold = () => insertText('**', '**', 'жирний текст');
  const insertItalic = () => insertText('*', '*', 'курсив');
  const insertCode = () => insertText('`', '`', 'код');
  const insertCodeBlock = () => insertText('```\n', '\n```', 'код');
  const insertLink = () => insertText('[', '](https://example.com)', 'текст посилання');
  const insertImage = () => insertText('![', '](https://example.com/image.png)', 'альтернативний текст');
  const insertQuote = () => insertText('> ', '', 'цитата');
  const insertBulletList = () => insertText('- ', '\n- ', 'елемент списку');
  const insertNumberedList = () => insertText('1. ', '\n2. ', 'елемент списку');

  const insertHeading = (level: number) => {
    const hashes = '#'.repeat(level);
    insertText(hashes + ' ', '', `Заголовок ${level} рівня`);
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Редактор" />
        <Tab label="Попередній перегляд" />
      </Tabs>
      {tab === 0 ? (
        <Box>
          {/* Панель швидких команд */}
          <Paper
            elevation={1}
            sx={{
              p: 1,
              mb: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              alignItems: 'center',
              backgroundColor: 'grey.50',
            }}
          >
            <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary', fontWeight: 600 }}>
              Швидкі команди:
            </Typography>
            
            {/* Заголовки */}
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Заголовок 1">
                <IconButton size="small" onClick={() => insertHeading(1)}>
                  <TitleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Заголовок 2">
                <IconButton size="small" onClick={() => insertHeading(2)}>
                  <TitleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Заголовок 3">
                <IconButton size="small" onClick={() => insertHeading(3)}>
                  <TitleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Форматування тексту */}
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Жирний (Ctrl+B)">
                <IconButton size="small" onClick={insertBold}>
                  <FormatBoldIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Курсив (Ctrl+I)">
                <IconButton size="small" onClick={insertItalic}>
                  <FormatItalicIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Код">
                <IconButton size="small" onClick={insertCode}>
                  <CodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Списки */}
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Маркований список">
                <IconButton size="small" onClick={insertBulletList}>
                  <FormatListBulletedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Нумерований список">
                <IconButton size="small" onClick={insertNumberedList}>
                  <FormatListNumberedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Посилання та медіа */}
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Посилання">
                <IconButton size="small" onClick={insertLink}>
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Зображення">
                <IconButton size="small" onClick={insertImage}>
                  <ImageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Інші */}
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Цитата">
                <IconButton size="small" onClick={insertQuote}>
                  <FormatQuoteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Блок коду">
                <IconButton size="small" onClick={insertCodeBlock}>
                  <CodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Paper>

          <TextField
            inputRef={textFieldRef}
            fullWidth
            multiline
            rows={15}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            label={label}
            error={error}
            helperText={helperText}
            placeholder="Введіть текст у форматі Markdown..."
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '14px',
              },
            }}
          />
        </Box>
      ) : (
        <Paper
          sx={{
            p: 2,
            minHeight: '400px',
            border: error ? '1px solid red' : '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: '4px',
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
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Попередній перегляд з'явиться тут...
            </Typography>
          )}
        </Paper>
      )}
      {helperText && tab === 1 && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default MarkdownEditor;
