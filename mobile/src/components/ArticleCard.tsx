import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {getImageUrl} from '../utils/videoQuality';
import {API_BASE_URL} from '../constants/config';
import {rp} from '../utils/responsive';
import {fadeIn, slideInFromBottom} from '../utils/animations';
import type {KnowledgeArticle} from '../types';

interface ArticleCardProps {
  article: KnowledgeArticle;
}

const ArticleCard: React.FC<ArticleCardProps> = ({article}) => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      fadeIn(fadeAnim, 300),
      slideInFromBottom(slideAnim, 30, 300),
    ]).start();
  }, []);

  const handlePress = () => {
    (navigation as any).navigate('ArticleView', {articleId: article._id});
  };

  // Extract image URL if exists in content (basic implementation)
  const imageUrl = article.image_url
    ? getImageUrl(article.image_url, API_BASE_URL)
    : null;

  // Get preview text (first 150 characters)
  const previewText = article.content
    ? article.content.replace(/[#*\[\]()]/g, '').substring(0, 150) + '...'
    : '';

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{translateY: slideAnim}],
      }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card style={styles.card} mode="elevated">
        {imageUrl && (
          <FastImage
            source={{
              uri: imageUrl,
              priority: FastImage.priority.normal,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        <Card.Content>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>
          {previewText && (
            <Text variant="bodySmall" style={styles.preview} numberOfLines={3}>
              {previewText}
            </Text>
          )}
          <View style={styles.footer}>
            <Text variant="bodySmall" style={styles.views}>
              👁 {article.views_count || 0} переглядів
            </Text>
            {article.created_at && (
              <Text variant="bodySmall" style={styles.date}>
                {new Date(article.created_at).toLocaleDateString('uk-UA')}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: rp(150),
  },
  title: {
    fontWeight: 'bold',
    marginTop: rp(8),
    marginBottom: rp(4),
    color: '#212121',
  },
  preview: {
    color: '#757575',
    marginBottom: rp(8),
    lineHeight: rp(18),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: rp(8),
    paddingTop: rp(8),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  views: {
    color: '#757575',
  },
  date: {
    color: '#757575',
  },
});

export default ArticleCard;

