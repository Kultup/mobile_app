import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Text, TextInput, Button, Card} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import SafeAreaView from '../../components/SafeAreaView';
import CityPicker from '../../components/CityPicker';
import PositionPicker from '../../components/PositionPicker';
import {authService} from '../../services/auth.service';
import {useAuth} from '../../contexts/AuthContext';
import {RegisterData} from '../../types';
import {rp, wp} from '../../utils/responsive';

interface RegisterFormData {
  full_name: string;
  city_id: string;
  position_id: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const {login} = useAuth();
  const [error, setError] = useState<string>('');

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<RegisterFormData>({
    defaultValues: {
      full_name: '',
      city_id: '',
      position_id: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const registerData: RegisterData = {
        full_name: data.full_name,
        city: data.city_id,
        position: data.position_id,
        password: data.password,
      };
      return authService.register(registerData);
    },
    onSuccess: (response) => {
      login(response.user);
      setError('');
      // Navigation will be handled by AppNavigator
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          'Помилка реєстрації. Можливо, користувач вже існує.',
      );
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                Реєстрація
              </Text>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <Controller
                control={control}
                name="full_name"
                rules={{required: 'ПІБ обов\'язкове'}}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    label="ПІБ"
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.full_name}
                    style={styles.input}
                    mode="outlined"
                  />
                )}
              />
              {errors.full_name && (
                <Text style={styles.errorText}>
                  {errors.full_name.message}
                </Text>
              )}

              <Controller
                control={control}
                name="city_id"
                rules={{required: 'Місто обов\'язкове'}}
                render={({field: {onChange, value}}) => (
                  <CityPicker
                    selectedCityId={value}
                    onCityChange={onChange}
                    error={errors.city_id?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="position_id"
                rules={{required: 'Посада обов\'язкова'}}
                render={({field: {onChange, value}}) => (
                  <PositionPicker
                    selectedPositionId={value}
                    onPositionChange={onChange}
                    error={errors.position_id?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Пароль обов\'язковий',
                  minLength: {
                    value: 6,
                    message: 'Пароль має бути мінімум 6 символів',
                  },
                }}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    label="Пароль"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    error={!!errors.password}
                    style={styles.input}
                    mode="outlined"
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Підтвердження пароля обов\'язкове',
                  validate: value =>
                    value === password || 'Паролі не співпадають',
                }}
                render={({field: {onChange, value}}) => (
                  <TextInput
                    label="Підтвердити пароль"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    error={!!errors.confirmPassword}
                    style={styles.input}
                    mode="outlined"
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.button}>
                Зареєструватися
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                style={styles.linkButton}>
                Вже є акаунт? Увійти
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: rp(16),
  },
  card: {
    width: '100%',
    maxWidth: wp(90),
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: rp(24),
    fontWeight: 'bold',
  },
  input: {
    marginBottom: rp(16),
  },
  button: {
    marginTop: rp(8),
    marginBottom: rp(16),
    paddingVertical: rp(4),
  },
  linkButton: {
    marginTop: rp(8),
  },
  errorText: {
    color: '#d32f2f',
    fontSize: rp(12),
    marginBottom: rp(8),
  },
});

export default RegisterScreen;

