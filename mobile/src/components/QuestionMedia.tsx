import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {Text, Menu, ProgressBar} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
// @ts-ignore - react-native-video types may not be available
import Video from 'react-native-video';
import {getVideoUrl, getImageUrl, detectVideoQuality} from '../utils/videoQuality';
import {API_BASE_URL, VIDEO_QUALITIES} from '../constants/config';
import {rp} from '../utils/responsive';
import type {VideoQuality} from '../types';

interface QuestionMediaProps {
  mediaType: 'none' | 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
}

const QuestionMedia: React.FC<QuestionMediaProps> = ({
  mediaType,
  imageUrl,
  videoUrl,
  videoThumbnailUrl,
}) => {
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('480p');
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [qualityMenuVisible, setQualityMenuVisible] = useState(false);

  useEffect(() => {
    if (mediaType === 'video') {
      detectVideoQuality().then(quality => {
        setVideoQuality(quality);
      });
    }
  }, [mediaType]);

  const handleQualityChange = (quality: VideoQuality) => {
    setVideoQuality(quality);
    setQualityMenuVisible(false);
    setIsVideoLoading(true);
    setLoadProgress(0);
    setBuffered(0);
  };

  if (mediaType === 'none') {
    return null;
  }

  if (mediaType === 'image' && imageUrl) {
    const fullImageUrl = getImageUrl(imageUrl, API_BASE_URL);
    return (
      <View style={styles.container}>
        <FastImage
          source={{
            uri: fullImageUrl,
            priority: FastImage.priority.normal,
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    );
  }

  if (mediaType === 'video' && videoUrl) {
    const fullVideoUrl = getVideoUrl(videoUrl, videoQuality, API_BASE_URL);
    const thumbnailUrl = videoThumbnailUrl
      ? getImageUrl(videoThumbnailUrl, API_BASE_URL)
      : null;

    return (
      <View style={styles.container}>
        {!showVideo && thumbnailUrl && (
          <TouchableOpacity
            style={styles.thumbnailContainer}
            onPress={() => setShowVideo(true)}
            activeOpacity={0.8}>
            <FastImage
              source={{
                uri: thumbnailUrl,
                priority: FastImage.priority.normal,
              }}
              style={styles.thumbnail}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </TouchableOpacity>
        )}

        {showVideo && (
          <View style={styles.videoContainer}>
            {/* Quality selector menu */}
            <View style={styles.qualitySelector}>
              <Menu
                visible={qualityMenuVisible}
                onDismiss={() => setQualityMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => setQualityMenuVisible(true)}
                    style={styles.qualityButton}>
                    <Text style={styles.qualityButtonText}>{videoQuality}</Text>
                  </TouchableOpacity>
                }>
                {VIDEO_QUALITIES.map(quality => (
                  <Menu.Item
                    key={quality}
                    onPress={() => handleQualityChange(quality)}
                    title={quality}
                    titleStyle={
                      videoQuality === quality ? styles.selectedQuality : undefined
                    }
                  />
                ))}
              </Menu>
            </View>

            {/* Loading progress */}
            {isVideoLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                {loadProgress > 0 && (
                  <View style={styles.progressContainer}>
                    <ProgressBar
                      progress={loadProgress}
                      color="#6200ee"
                      style={styles.progressBar}
                    />
                    <Text style={styles.progressText}>
                      {Math.round(loadProgress * 100)}%
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Video
              key={fullVideoUrl} // Force re-render when quality changes
              source={{uri: fullVideoUrl}}
              style={styles.video}
              controls
              resizeMode="contain"
              onLoadStart={() => {
                setIsVideoLoading(true);
                setLoadProgress(0);
              }}
              onLoad={() => {
                setIsVideoLoading(false);
                setLoadProgress(1);
              }}
              onProgress={(data: any) => {
                if (data.seekableDuration > 0) {
                  const progress = data.currentTime / data.seekableDuration;
                  setLoadProgress(progress);
                  setBuffered(data.playableDuration / data.seekableDuration);
                }
              }}
              onBuffer={(data: {isBuffering: boolean}) => {
                if (data.isBuffering) {
                  setIsVideoLoading(true);
                } else {
                  setIsVideoLoading(false);
                }
              }}
              onError={(error: any) => {
                console.error('Video error:', error);
                setIsVideoLoading(false);
              }}
            />
          </View>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: rp(16),
    borderRadius: rp(8),
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: rp(200),
    borderRadius: rp(8),
  },
  thumbnailContainer: {
    width: '100%',
    height: rp(200),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    width: rp(60),
    height: rp(60),
    borderRadius: rp(30),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: rp(24),
    marginLeft: rp(4),
  },
  videoContainer: {
    width: '100%',
    height: rp(200),
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  qualitySelector: {
    position: 'absolute',
    top: rp(8),
    right: rp(8),
    zIndex: 2,
  },
  qualityButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: rp(12),
    paddingVertical: rp(6),
    borderRadius: rp(16),
  },
  qualityButtonText: {
    color: '#fff',
    fontSize: rp(12),
    fontWeight: '600',
  },
  selectedQuality: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '80%',
    marginTop: rp(16),
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: rp(4),
    borderRadius: rp(2),
  },
  progressText: {
    color: '#fff',
    fontSize: rp(12),
    marginTop: rp(8),
    fontWeight: '500',
  },
});

export default QuestionMedia;

