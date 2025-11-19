import React, {useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {Text, Chip} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import SafeAreaView from '../../components/SafeAreaView';
import SearchBar from '../../components/SearchBar';
import ArticleCard from '../../components/ArticleCard';
import {SkeletonCard} from '../../components/SkeletonLoader';
import {knowledgeBaseService} from '../../services/knowledge-base.service';
import {rp} from '../../utils/responsive';
import type {KnowledgeArticle} from '../../types';

const KnowledgeBaseScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Get categories
  const {data: categories = []} = useQuery({
    queryKey: ['knowledgeBaseCategories'],
    queryFn: () => knowledgeBaseService.getCategories(),
  });

  // Get articles
  const {
    data: articlesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['knowledgeBaseArticles', selectedCategory, searchQuery, page],
    queryFn: () =>
      knowledgeBaseService.getArticles({
        page,
        per_page: 20,
        category_id: selectedCategory,
        search: searchQuery || undefined,
      }),
  });

  const articles = articlesData?.data || [];
  const hasMore = articlesData?.meta
    ? page < articlesData.meta.total_pages
    : false;

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategorySelect = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const renderCategoryChip = (category: any) => (
    <Chip
      key={category._id}
      selected={selectedCategory === category._id}
      onPress={() =>
        handleCategorySelect(
          selectedCategory === category._id ? undefined : category._id,
        )
      }
      style={styles.chip}
      mode={selectedCategory === category._id ? 'flat' : 'outlined'}>
      {category.name}
    </Chip>
  );

  const renderArticle = ({item}: {item: KnowledgeArticle}) => (
    <ArticleCard article={item} />
  );

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
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery || selectedCategory
            ? 'Статті не знайдено'
            : 'Немає доступних статей'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            База знань
          </Text>
        </View>

        <SearchBar
          placeholder="Пошук статей..."
          onSearch={handleSearch}
        />

        {categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <Chip
              selected={!selectedCategory}
              onPress={() => handleCategorySelect(undefined)}
              style={styles.chip}
              mode={!selectedCategory ? 'flat' : 'outlined'}>
              Всі
            </Chip>
            {categories.map(renderCategoryChip)}
          </View>
        )}

        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={item => item._id}
          contentContainerStyle={
            articles.length === 0 ? styles.emptyList : styles.list
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
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: rp(16),
    paddingVertical: rp(8),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chip: {
    marginRight: rp(8),
    marginBottom: rp(8),
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
    padding: rp(16),
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

export default KnowledgeBaseScreen;

