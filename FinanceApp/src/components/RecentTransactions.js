import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS, RADIUS, FONTS, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/theme';

export default function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No recent transactions</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {transactions.map((txn, idx) => {
        const color = CATEGORY_COLORS[txn.category] || COLORS.textMuted;
        const icon = CATEGORY_ICONS[txn.category] || 'ellipsis-horizontal';
        return (
          <View key={txn.id} style={[styles.row, idx < transactions.length - 1 && styles.rowBorder]}>
            <View style={[styles.icon, { backgroundColor: color + '18' }]}>
              <Ionicons name={icon} size={17} color={color} />
            </View>
            <View style={styles.info}>
              <Text style={styles.note} numberOfLines={1}>{txn.note || txn.category}</Text>
              <Text style={styles.cat}>{txn.category} · {format(new Date(txn.date), 'MMM d')}</Text>
            </View>
            <Text style={[styles.amount, { color: txn.type === 'income' ? COLORS.primary : COLORS.danger }]}>
              {txn.type === 'income' ? '+' : '-'}${txn.amount.toLocaleString()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  note: { fontSize: 14, fontWeight: FONTS.medium, color: COLORS.textPrimary },
  cat: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  amount: { fontSize: 14, fontWeight: FONTS.bold },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
