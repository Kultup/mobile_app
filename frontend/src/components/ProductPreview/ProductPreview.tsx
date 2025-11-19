import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import { ShopProduct } from '../../services/shop.service';

interface ProductPreviewProps {
  product: Partial<ShopProduct>;
}

const ProductPreview = ({ product }: ProductPreviewProps) => {
  const productTypeLabels: Record<string, string> = {
    avatar: 'Аватарка',
    profile_frame: 'Рамка профілю',
    badge: 'Бейдж',
    theme: 'Тема',
    customization: 'Кастомізація',
    gift: 'Подарунок',
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Preview товару
      </Typography>
      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          p: 3,
          bgcolor: '#fafafa',
          textAlign: 'center',
        }}
      >
        {/* Зображення товару */}
        {product.image_url ? (
          <Box sx={{ mb: 2 }}>
            {product.product_type === 'avatar' ? (
              <Avatar
                src={product.image_url}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
            ) : (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 8,
                  objectFit: 'contain',
                }}
              />
            )}
          </Box>
        ) : (
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: '#e0e0e0',
              borderRadius: 2,
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Немає зображення
            </Typography>
          </Box>
        )}

        {/* Назва */}
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {product.name || 'Назва товару'}
        </Typography>

        {/* Тип */}
        {product.product_type && (
          <Chip
            label={productTypeLabels[product.product_type] || product.product_type}
            size="small"
            color="primary"
            sx={{ mb: 1 }}
          />
        )}

        {/* Опис */}
        {product.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            {product.description}
          </Typography>
        )}

        {/* Ціна */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {product.price || 0} балів
          </Typography>
        </Box>

        {/* Premium статус */}
        {product.is_premium && (
          <Chip label="Premium" color="warning" size="small" sx={{ mt: 1 }} />
        )}
      </Box>
    </Paper>
  );
};

export default ProductPreview;

