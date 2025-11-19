import { Typography, Box } from '@mui/material';
import ShopCategoriesManager from '../../components/ShopCategoriesManager/ShopCategoriesManager';

const ShopCategoriesPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Категорії товарів магазину
      </Typography>
      <ShopCategoriesManager />
    </Box>
  );
};

export default ShopCategoriesPage;

