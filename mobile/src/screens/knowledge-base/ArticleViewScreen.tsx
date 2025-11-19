import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {Text, Card, Button, IconButton} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import FastImage from 'react-native-fast-image';
import {getImageUrl} from '../../utils/videoQuality';
import {API_BASE_URL} from '../../constants/config';
import {knowledgeBaseService} from '../../services/knowledge-base.service';
import {rp} from '../../utils/responsive';
import type {KnowledgeArticle} from '../../types';

interface ArticleViewScreenParams {
  articleId: string;
}

const ArticleViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as ArticleViewScreenParams) || {};
  const {articleId} = params;

  const {data: article, isLoading} = useQuery({
    queryKey: ['knowledgeBaseArticle', articleId],
    queryFn: () => knowledgeBaseService.getArticle(articleId),
    enabled: !!articleId,
  });

  const imageUrl = article?.image_url
    ? getImageUrl(article.image_url, API_BASE_URL)
    : null;

  const handlePdfPress = () => {
    if (article?.pdf_url) {
      const pdfUrl = article.pdf_url.includes('http')
        ? article.pdf_url
        : `${API_BASE_URL}/files/${article.pdf_url}`;
      Linking.openURL(pdfUrl).catch(err =>
        console.error('Failed to open PDF:', err),
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Завантаження статті...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Статтю не знайдено</Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}>
            Назад
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text variant="titleMedium" style={styles.headerTitle} numberOfLines={1}>
            Стаття
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {imageUrl && (
            <FastImage
              source={{
                uri: imageUrl,
                priority: FastImage.priority.high,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="headlineSmall" style={styles.title}>
                {article.title}
              </Text>

              <View style={styles.metaContainer}>
                {article.views_count !== undefined && (
                  <View style={styles.metaItem}>
                    <Text variant="bodySmall" style={styles.metaText}>
                      👁 {article.views_count} переглядів
                    </Text>
                  </View>
                )}
                {article.created_at && (
                  <View style={styles.metaItem}>
                    <Text variant="bodySmall" style={styles.metaText}>
                      📅 {new Date(article.created_at).toLocaleDateString('uk-UA')}
                    </Text>
                  </View>
                )}
              </View>

              {article.pdf_url && (
                <Button
                  mode="outlined"
                  icon="file-pdf-box"
                  onPress={handlePdfPress}
                  style={styles.pdfButton}>
                  Відкрити PDF
                </Button>
              )}

              <View style={styles.contentContainer}>
                <Text
                  variant="bodyLarge"
                  style={styles.content}
                  selectable>
                  {article.content}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: rp(4),
  },
  headerTitle: {
    flex: 1,
    fontWeight: 'bold',
    marginLeft: rp(8),
  },
  headerSpacer: {
    width: rp(48),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rp(16),
  },
  image: {
    width: '100%',
    height: rp(200),
    backgroundColor: '#e0e0e0',
  },
  card: {
    margin: rp(16),
    marginTop: rp(8),
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: rp(16),
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: rp(16),
    paddingBottom: rp(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  metaItem: {
    marginRight: rp(16),
    marginBottom: rp(4),
  },
  metaText: {
    color: '#757575',
  },
  pdfButton: {
    marginBottom: rp(16),
  },
  contentContainer: {
    marginTop: rp(8),
  },
  content: {
    color: '#212121',
    lineHeight: rp(24),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: rp(16),
    fontSize: rp(16),
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rp(32),
  },
  errorText: {
    fontSize: rp(16),
    color: '#d32f2f',
    marginBottom: rp(24),
    textAlign: 'center',
  },
  button: {
    marginTop: rp(16),
  },
});

export default ArticleViewScreen;

