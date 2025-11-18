import { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { TextField } from '@mui/material';

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

  return (
    <Box>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Редактор" />
        <Tab label="Попередній перегляд" />
      </Tabs>
      {tab === 0 ? (
        <TextField
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

