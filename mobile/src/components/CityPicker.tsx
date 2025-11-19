import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Text} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {citiesService} from '../services/cities.service';
import {rp} from '../utils/responsive';

interface CityPickerProps {
  selectedCityId?: string;
  onCityChange: (cityId: string) => void;
  error?: string;
}

const CityPicker: React.FC<CityPickerProps> = ({
  selectedCityId,
  onCityChange,
  error,
}) => {
  const {data: cities = [], isLoading} = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesService.getAll(),
  });

  const activeCities = cities.filter(city => city.is_active);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>
        Місто
      </Text>
      <View style={[styles.pickerContainer, error && styles.error]}>
        <Picker
          selectedValue={selectedCityId || ''}
          onValueChange={onCityChange}
          style={styles.picker}
          enabled={!isLoading}>
          <Picker.Item label="Оберіть місто" value="" />
          {activeCities.map(city => (
            <Picker.Item
              key={city._id}
              label={city.name}
              value={city._id}
            />
          ))}
        </Picker>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: rp(16),
  },
  label: {
    marginBottom: rp(8),
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: rp(50),
  },
  error: {
    borderColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: rp(12),
    marginTop: rp(4),
  },
});

export default CityPicker;


