import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Text} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {positionsService} from '../services/positions.service';
import {rp} from '../utils/responsive';

interface PositionPickerProps {
  selectedPositionId?: string;
  onPositionChange: (positionId: string) => void;
  error?: string;
}

const PositionPicker: React.FC<PositionPickerProps> = ({
  selectedPositionId,
  onPositionChange,
  error,
}) => {
  const {data: positions = [], isLoading} = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsService.getAll(),
  });

  const activePositions = positions.filter(position => position.is_active);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>
        Посада
      </Text>
      <View style={[styles.pickerContainer, error && styles.error]}>
        <Picker
          selectedValue={selectedPositionId || ''}
          onValueChange={onPositionChange}
          style={styles.picker}
          enabled={!isLoading}>
          <Picker.Item label="Оберіть посаду" value="" />
          {activePositions.map(position => (
            <Picker.Item
              key={position._id}
              label={position.name}
              value={position._id}
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

export default PositionPicker;

