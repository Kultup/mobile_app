import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  Divider,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import {useToastContext} from '../../components/ToastProvider';
import {userService} from '../../services/user.service';
import {shopService} from '../../services/shop.service';
import {useAuth} from '../../contexts/AuthContext';
import CityPicker from '../../components/CityPicker';
import PositionPicker from '../../components/PositionPicker';
import {rp} from '../../utils/responsive';
import {getImageUrl} from '../../utils/videoQuality';
import {API_BASE_URL} from '../../constants/config';
import FastImage from 'react-native-fast-image';
import type {UserPurchase, ShopProduct} from '../../types';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {user, logout, refreshUser} = useAuth();
  const toast = useToastContext();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [frameModalVisible, setFrameModalVisible] = useState(false);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    city_id: '',
    position_id: '',
  });

  // Get user profile with full details
  const {data: profile, isLoading} = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
    enabled: !!user,
  });

  // Get purchases for avatars
  const {data: avatarPurchases} = useQuery({
    queryKey: ['purchases', 'avatar'],
    queryFn: () => shopService.getPurchases(1, 100),
    select: data => {
      return data.data.filter(p => {
        const product =
          typeof p.product_id === 'string' ? null : p.product_id;
        return product && product.product_type === 'avatar';
      });
    },
  });

  // Get purchases for frames
  const {data: framePurchases} = useQuery({
    queryKey: ['purchases', 'frame'],
    queryFn: () => shopService.getPurchases(1, 100),
    select: data => {
      return data.data.filter(p => {
        const product =
          typeof p.product_id === 'string' ? null : p.product_id;
        return product && product.product_type === 'profile_frame';
      });
    },
  });

  // Get purchases for badges
  const {data: badgePurchases} = useQuery({
    queryKey: ['purchases', 'badge'],
    queryFn: () => shopService.getPurchases(1, 100),
    select: data => {
      return data.data.filter(p => {
        const product =
          typeof p.product_id === 'string' ? null : p.product_id;
        return product && product.product_type === 'badge';
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: {full_name?: string; city_id?: string; position_id?: string}) =>
      userService.updateProfile(data),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({queryKey: ['userProfile']});
      setEditModalVisible(false);
      toast.showSuccess('Профіль оновлено');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Не вдалося оновити профіль');
    },
  });

  const applyProductMutation = useMutation({
    mutationFn: (purchaseId: string) => shopService.applyProduct(purchaseId),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({queryKey: ['userProfile']});
      queryClient.invalidateQueries({queryKey: ['purchases']});
      toast.showSuccess('Товар застосовано');
    },
    onError: (error: any) => {
      toast.showError(error.response?.data?.message || 'Не вдалося застосувати товар');
    },
  });

  const handleEdit = () => {
    if (profile) {
      const cityId =
        typeof profile.city === 'string'
          ? ''
          : (profile.city as any)?._id || '';
      const positionId =
        typeof profile.position === 'string'
          ? ''
          : (profile.position as any)?._id || '';

      setEditForm({
        full_name: profile.full_name || '',
        city_id: cityId,
        position_id: positionId,
      });
      setEditModalVisible(true);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleLogout = () => {
    Alert.alert('Вихід', 'Ви впевнені, що хочете вийти?', [
      {text: 'Скасувати', style: 'cancel'},
      {
        text: 'Вийти',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const handleSelectAvatar = (purchase: UserPurchase) => {
    applyProductMutation.mutate(purchase._id);
    setAvatarModalVisible(false);
  };

  const handleSelectFrame = (purchase: UserPurchase) => {
    applyProductMutation.mutate(purchase._id);
    setFrameModalVisible(false);
  };

  const handleSelectBadge = (purchase: UserPurchase) => {
    applyProductMutation.mutate(purchase._id);
    setBadgeModalVisible(false);
  };

  if (isLoading || !profile) {
    return (
      <SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      </SafeAreaView>
    );
  }

  const currentCity =
    typeof profile.city === 'string' ? profile.city : profile.city?.name || '';
  const currentPosition =
    typeof profile.position === 'string'
      ? profile.position
      : profile.position?.name || '';

  const currentAvatar =
    typeof profile.avatar_id === 'string'
      ? null
      : (profile.avatar_id as any)?.image_url;
  const currentFrame =
    typeof profile.profile_frame_id === 'string'
      ? null
      : (profile.profile_frame_id as any)?.image_url;

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <Card style={styles.headerCard} mode="elevated">
          <Card.Content style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {currentAvatar ? (
                <FastImage
                  source={{
                    uri: getImageUrl(currentAvatar, API_BASE_URL),
                    priority: FastImage.priority.high,
                  }}
                  style={styles.avatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <Avatar.Text
                  size={rp(80)}
                  label={profile.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                />
              )}
              {currentFrame && (
                <FastImage
                  source={{
                    uri: getImageUrl(currentFrame, API_BASE_URL),
                    priority: FastImage.priority.high,
                  }}
                  style={styles.frame}
                  resizeMode={FastImage.resizeMode.cover}
                />
              )}
            </View>
            <Text variant="headlineSmall" style={styles.name}>
              {profile.full_name}
            </Text>
            <Text variant="bodyMedium" style={styles.info}>
              {currentCity} • {currentPosition}
            </Text>
          </Card.Content>
        </Card>

        {/* Balance Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.balanceRow}>
              <Text variant="titleMedium">Баланс балів</Text>
              <Text variant="headlineSmall" style={styles.balance}>
                {profile.points_balance || 0} 🪙
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Active Items */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Активні товари
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.activeItemsRow}>
              <Button
                mode="outlined"
                onPress={() => setAvatarModalVisible(true)}
                icon="account"
                style={styles.itemButton}>
                Аватарка
              </Button>
              <Button
                mode="outlined"
                onPress={() => setFrameModalVisible(true)}
                icon="image-frame"
                style={styles.itemButton}>
                Рамка
              </Button>
              <Button
                mode="outlined"
                onPress={() => setBadgeModalVisible(true)}
                icon="medal"
                style={styles.itemButton}>
                Бейджі
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Button
              mode="contained"
              onPress={() => (navigation as any).navigate('Achievements')}
              icon="trophy"
              style={styles.actionButton}>
              Мої ачівки
            </Button>
            <Button
              mode="outlined"
              onPress={handleEdit}
              icon="pencil"
              style={styles.actionButton}>
              Редагувати профіль
            </Button>
            <Button
              mode="outlined"
              onPress={() => (navigation as any).navigate('Purchases')}
              icon="history"
              style={styles.actionButton}>
              Історія покупок
            </Button>
            <Button
              mode="outlined"
              onPress={() => (navigation as any).navigate('Statistics')}
              icon="chart-line"
              style={styles.actionButton}>
              Статистика
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              textColor="#f44336"
              style={styles.actionButton}>
              Вихід
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContent}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Редагувати профіль
          </Text>
          <TextInput
            label="ПІБ"
            value={editForm.full_name}
            onChangeText={text => setEditForm({...editForm, full_name: text})}
            style={styles.input}
          />
          <CityPicker
            selectedCityId={editForm.city_id}
            onCityChange={cityId => setEditForm({...editForm, city_id: cityId})}
          />
          <PositionPicker
            selectedPositionId={editForm.position_id}
            onPositionChange={positionId =>
              setEditForm({...editForm, position_id: positionId})
            }
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalButton}>
              Скасувати
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={updateProfileMutation.isPending}
              style={styles.modalButton}>
              Зберегти
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Avatar Selection Modal */}
      <Portal>
        <Modal
          visible={avatarModalVisible}
          onDismiss={() => setAvatarModalVisible(false)}
          contentContainerStyle={styles.modalContent}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Виберіть аватарку
          </Text>
          <ScrollView style={styles.modalScroll}>
            {avatarPurchases && avatarPurchases.length > 0 ? (
              avatarPurchases.map(purchase => {
                const product =
                  typeof purchase.product_id === 'string'
                    ? null
                    : (purchase.product_id as ShopProduct);
                if (!product) return null;

                const imageUrl = product.image_url
                  ? getImageUrl(product.image_url, API_BASE_URL)
                  : null;

                return (
                  <Button
                    key={purchase._id}
                    mode={purchase.is_applied ? 'contained' : 'outlined'}
                    onPress={() => handleSelectAvatar(purchase)}
                    disabled={applyProductMutation.isPending}
                    icon={purchase.is_applied ? 'check' : undefined}
                    style={styles.productButton}>
                    {product.name}
                  </Button>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Немає куплених аватарок</Text>
            )}
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setAvatarModalVisible(false)}
            style={styles.modalButton}>
            Закрити
          </Button>
        </Modal>
      </Portal>

      {/* Frame Selection Modal */}
      <Portal>
        <Modal
          visible={frameModalVisible}
          onDismiss={() => setFrameModalVisible(false)}
          contentContainerStyle={styles.modalContent}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Виберіть рамку
          </Text>
          <ScrollView style={styles.modalScroll}>
            {framePurchases && framePurchases.length > 0 ? (
              framePurchases.map(purchase => {
                const product =
                  typeof purchase.product_id === 'string'
                    ? null
                    : (purchase.product_id as ShopProduct);
                if (!product) return null;

                return (
                  <Button
                    key={purchase._id}
                    mode={purchase.is_applied ? 'contained' : 'outlined'}
                    onPress={() => handleSelectFrame(purchase)}
                    disabled={applyProductMutation.isPending}
                    icon={purchase.is_applied ? 'check' : undefined}
                    style={styles.productButton}>
                    {product.name}
                  </Button>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Немає куплених рамок</Text>
            )}
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setFrameModalVisible(false)}
            style={styles.modalButton}>
            Закрити
          </Button>
        </Modal>
      </Portal>

      {/* Badge Selection Modal */}
      <Portal>
        <Modal
          visible={badgeModalVisible}
          onDismiss={() => setBadgeModalVisible(false)}
          contentContainerStyle={styles.modalContent}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Виберіть бейджі
          </Text>
          <ScrollView style={styles.modalScroll}>
            {badgePurchases && badgePurchases.length > 0 ? (
              badgePurchases.map(purchase => {
                const product =
                  typeof purchase.product_id === 'string'
                    ? null
                    : (purchase.product_id as ShopProduct);
                if (!product) return null;

                const isActive =
                  profile.active_badges &&
                  profile.active_badges.length > 0 &&
                  (typeof profile.active_badges[0] === 'string'
                    ? (profile.active_badges as string[]).includes(product._id)
                    : (profile.active_badges as any[]).some(
                        (b: any) => (b._id || b) === product._id,
                      ));

                return (
                  <Button
                    key={purchase._id}
                    mode={isActive ? 'contained' : 'outlined'}
                    onPress={() => handleSelectBadge(purchase)}
                    disabled={applyProductMutation.isPending}
                    icon={isActive ? 'check' : undefined}
                    style={styles.productButton}>
                    {product.name}
                  </Button>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Немає куплених бейджів</Text>
            )}
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setBadgeModalVisible(false)}
            style={styles.modalButton}>
            Закрити
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: rp(16),
    marginBottom: rp(8),
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: rp(16),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: rp(12),
  },
  avatar: {
    width: rp(80),
    height: rp(80),
    borderRadius: rp(40),
    borderWidth: 3,
    borderColor: '#6200ee',
  },
  frame: {
    position: 'absolute',
    top: rp(-10),
    left: rp(-10),
    width: rp(100),
    height: rp(100),
    borderRadius: rp(50),
  },
  name: {
    fontWeight: 'bold',
    marginBottom: rp(4),
    textAlign: 'center',
  },
  info: {
    color: '#757575',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balance: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: rp(8),
  },
  divider: {
    marginBottom: rp(16),
  },
  activeItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rp(8),
  },
  itemButton: {
    flex: 1,
    minWidth: rp(100),
  },
  actionButton: {
    marginBottom: rp(8),
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: rp(20),
    margin: rp(20),
    borderRadius: rp(8),
    maxHeight: '80%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: rp(16),
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: rp(300),
  },
  input: {
    marginBottom: rp(16),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: rp(16),
    gap: rp(8),
  },
  modalButton: {
    flex: 1,
  },
  productButton: {
    marginBottom: rp(8),
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    padding: rp(16),
  },
});

export default ProfileScreen;

