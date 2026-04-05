import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { COLORS, RADIUS, FONTS, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/theme';

export default function CategoryPills() {
  const { getCategoryBreakdown, getMonthlyStats } = useFinance();
  const breakdown = getCategoryBreakdown('expense');
  const { expenses } = getMonthlyStats();

  if (breakdown.length === 0) {
    return <Text style={styles.empty}>No expense data this month</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {breakdown.slice(0, 6).map(item => {
        const color = CATEGORY_COLORS[item.category] || COLORS.textMuted;
        const icon = CATEGORY_ICONS[item.category] || 'ellipsis-horizontal';
        const pct = expenses > 0 ? Math.round((item.amount / expenses) * 100) : 0;
        return (
          <View key={item.category} style={[styles.pill, { borderColor: color + '40', backgroundColor: color + '10' }]}>
            <Ionicons name={icon} size={14} color={color} />
            <View>
              <Text style={[styles.catName, { color }]}>{item.category}</Text>
              <Text style={styles.catAmt}>${item.amount.toLocaleString()} · {pct}%</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 16 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  catName: { fontSize: 13, fontWeight: FONTS.semiBold },
  catAmt: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  empty: { fontSize: 14, color: COLORS.textMuted },
});
