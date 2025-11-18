import { Box, Typography } from '@mui/material';
import QuestionCategoriesManager from '../../components/QuestionCategoriesManager/QuestionCategoriesManager';

const QuestionCategoriesPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Категорії питань
      </Typography>
      <QuestionCategoriesManager />
    </Box>
  );
};

export default QuestionCategoriesPage;

