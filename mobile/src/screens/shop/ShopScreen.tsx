import React, {useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator, Alert} from 'react-native';
import {Text, SegmentedButtons, Card, Chip} from 'react-native-paper';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import ProductCard from '../../components/ProductCard';
import {useToastContext} from '../../components/ToastProvider';
import {SkeletonProductCard} from '../../components/SkeletonLoader';
import {shopService} from '../../services/shop.service';
import {useAuth} from '../../contexts/AuthContext';
import {rp} from '../../utils/responsive';
import type {ShopProduct} from '../../types';

type ProductType = 'all' | 'avatar' | 'profile_frame' | 'badge' | 'theme' | 'customization' | 'gift';

const ShopScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {user, refreshUser} = useAuth();
  const toast = useToastContext();
  const [selectedType, setSelectedType] = useState<ProductType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  // Get products
  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['shopProducts', selectedType, selectedCategory, page],
    queryFn: () =>
      shopService.getProducts({
        page,
        per_page: 20,
        product_type: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory,
      }),
  });

  // Get purchases to check which products are already purchased
  const {data: purchasesData} = useQuery({
    queryKey: ['purchases'],
    queryFn: () => shopService.getPurchases(1, 100),
  });

  const purchasedProductIds = new Set(
    purchasesData?.data?.map(p => {
      const productId =
        typeof p.product_id === 'string' ? p.product_id : p.product_id._id;
      return productId;
    }) || [],
  );

  const products = productsData?.data || [];
  const hasMore = productsData?.meta
    ? page < productsData.meta.total_pages
    : false;

  const purchaseMutation = useMutation({
    mutationFn: (productId: string) => shopService.purchase(productId),
    onSuccess: async (response) => {
      toast.showSuccess(response.message);
      await refreshUser();
      queryClient.invalidateQueries({queryKey: ['purchases']});
      queryClient.invalidateQueries({queryKey: ['shopProducts']});
    },
    onError: (error: any) => {
      toast.showError(
        error.response?.data?.message || 'Не вдалося придбати товар',
      );
    },
  });

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as ProductType);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handlePurchase = (product: ShopProduct) => {
    Alert.alert(
      'Підтвердження покупки',
      `Ви впевнені, що хочете купити "${product.name}" за ${product.price} монет?`,
      [
        {text: 'Скасувати', style: 'cancel'},
        {
          text: 'Купити',
          onPress: () => purchaseMutation.mutate(product._id),
        },
      ],
    );
  };

  const renderProduct = ({item}: {item: ShopProduct}) => {
    const isPurchased = purchasedProductIds.has(item._id);
    return (
      <ProductCard
        product={item}
        isPurchased={isPurchased}
        onPress={() => {
          // Navigate to product details if needed
        }}
        onPurchase={() => handlePurchase(item)}
      />
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.balanceContainer}>
          <Text variant="titleLarge" style={styles.balanceLabel}>
            Ваш баланс:
          </Text>
          <Text variant="displaySmall" style={styles.balanceValue}>
            {user?.points_balance || 0} 🪙
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6200ee" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonProductCard />
          <SkeletonProductCard />
          <SkeletonProductCard />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Товари не знайдено</Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.filtersContainer}>
          <SegmentedButtons
            value={selectedType}
            onValueChange={handleTypeChange}
            buttons={[
              {value: 'all', label: 'Всі'},
              {value: 'avatar', label: 'Аватарки'},
              {value: 'profile_frame', label: 'Рамки'},
              {value: 'badge', label: 'Бейджі'},
              {value: 'theme', label: 'Теми'},
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item._id}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Каталог товарів
              </Text>
            </View>
          }
          contentContainerStyle={
            products.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isLoading}
          onRefresh={() => {
            setPage(1);
            refetch();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: rp(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: rp(8),
  },
  balanceLabel: {
    color: '#757575',
    marginBottom: rp(4),
  },
  balanceValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  filtersContainer: {
    padding: rp(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  segmentedButtons: {
    backgroundColor: '#f5f5f5',
  },
  listHeader: {
    paddingHorizontal: rp(16),
    paddingVertical: rp(8),
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#212121',
  },
  list: {
    paddingVertical: rp(8),
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rp(32),
  },
  skeletonContainer: {
    padding: rp(8),
  },
  emptyText: {
    fontSize: rp(16),
    color: '#757575',
    textAlign: 'center',
    marginTop: rp(16),
  },
  footerLoader: {
    paddingVertical: rp(16),
    alignItems: 'center',
  },
});

export default ShopScreen;

