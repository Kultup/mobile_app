import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {LineChart} from 'react-native-chart-kit';
import {rp} from '../utils/responsive';

interface ProgressChartProps {
  data: Array<{
    date: string;
    score?: number;
    correct?: number;
  }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({data}) => {
  if (!data || data.length === 0) {
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Графік прогресу
          </Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Немає даних для відображення</Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: data.map(item => item.correct || item.score || 0),
        color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width - rp(64);

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Графік прогресу (останні 7 днів)
        </Text>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={rp(220)}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#6200ee',
            },
          }}
          bezier
          style={styles.chart}
          withVerticalLabels
          withHorizontalLabels
          withInnerLines={false}
          withOuterLines={true}
          withShadow={false}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: rp(16),
    marginVertical: rp(8),
  },
  title: {
    fontWeight: 'bold',
    marginBottom: rp(16),
    color: '#212121',
  },
  chart: {
    marginVertical: rp(8),
    borderRadius: rp(16),
  },
  emptyContainer: {
    height: rp(150),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#757575',
    fontSize: rp(14),
  },
});

export default ProgressChart;

