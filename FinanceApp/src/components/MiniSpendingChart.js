import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useFinance } from '../context/FinanceContext';
import { COLORS, RADIUS } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function MiniSpendingChart() {
  const { getWeeklyTrend } = useFinance();
  const trend = getWeeklyTrend();

  const data = {
    labels: trend.map(w => w.label),
    datasets: [{ data: trend.map(w => w.amount || 0) }],
  };

  return (
    <View style={styles.wrapper}>
      <BarChart
        data={data}
        width={width - 56}
        height={150}
        chartConfig={{
          backgroundGradientFrom: COLORS.bgCard,
          backgroundGradientTo: COLORS.bgCard,
          color: (opacity = 1) => `rgba(124, 110, 248, ${opacity})`,
          labelColor: () => COLORS.textSecondary,
          barPercentage: 0.65,
          decimalPlaces: 0,
          fillShadowGradientFrom: COLORS.accent,
          fillShadowGradientTo: COLORS.accent + '50',
          propsForLabels: { fontSize: 11 },
        }}
        style={{ borderRadius: RADIUS.md }}
        fromZero
        withInnerLines={false}
        showValuesOnTopOfBars={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
