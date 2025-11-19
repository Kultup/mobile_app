import React, {useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import SafeAreaView from '../../components/SafeAreaView';
import {shopService} from '../../services/shop.service';
import {rp} from '../../utils/responsive';
import type {UserPurchase} from '../../types';

const PurchasesScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const {
    data: purchasesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['purchases', page],
    queryFn: () => shopService.getPurchases(page, 20),
  });

  const applyMutation = useMutation({
    mutationFn: (purchaseId: string) => shopService.applyProduct(purchaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['purchases']});
    },
  });

  const purchases = purchasesData?.data || [];
  const hasMore = purchasesData?.meta
    ? page < purchasesData.meta.total_pages
    : false;

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const handleApply = (purchase: UserPurchase) => {
    applyMutation.mutate(purchase._id);
  };

  const renderPurchase = ({item}: {item: UserPurchase}) => {
    const product =
      typeof item.product_id === 'string'
        ? {_id: item.product_id, name: 'Товар'}
        : item.product_id;

    const purchaseDate = new Date(item.purchased_at);
    const formattedDate = purchaseDate.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.purchaseContainer}>
            <View style={styles.content}>
              <Text variant="titleMedium" style={styles.productName}>
                {product.name}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formattedDate}
              </Text>
              <Text variant="bodySmall" style={styles.price}>
                Ціна: {item.price_paid} монет
              </Text>
            </View>

            {!item.is_applied && (
              <Button
                mode="contained"
                onPress={() => handleApply(item)}
                loading={applyMutation.isPending}
                compact>
                Застосувати
              </Button>
            )}

            {item.is_applied && (
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedText}>✓ Застосовано</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.emptyText}>Завантаження історії...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Історія покупок порожня</Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Історія покупок
          </Text>
        </View>

        <FlatList
          data={purchases}
          renderItem={renderPurchase}
          keyExtractor={item => item._id}
          contentContainerStyle={
            purchases.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmpty}
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
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  list: {
    paddingVertical: rp(8),
  },
  emptyList: {
    flex: 1,
  },
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(4),
  },
  purchaseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: rp(4),
  },
  date: {
    color: '#757575',
    marginBottom: rp(4),
  },
  price: {
    color: '#757575',
  },
  appliedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: rp(12),
    paddingVertical: rp(6),
    borderRadius: rp(16),
  },
  appliedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: rp(12),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rp(32),
  },
  emptyText: {
    fontSize: rp(16),
    color: '#757575',
    textAlign: 'center',
    marginTop: rp(16),
  },
});

export default PurchasesScreen;

