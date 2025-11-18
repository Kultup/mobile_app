import { Box, Typography } from '@mui/material';
import KnowledgeBaseCategoriesManager from '../../components/KnowledgeBaseCategoriesManager/KnowledgeBaseCategoriesManager';

const KnowledgeBaseCategoriesPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Категорії бази знань
      </Typography>
      <KnowledgeBaseCategoriesManager />
    </Box>
  );
};

export default KnowledgeBaseCategoriesPage;

