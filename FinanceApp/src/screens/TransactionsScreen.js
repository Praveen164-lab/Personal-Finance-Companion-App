import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Animated, Dimensions, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { COLORS, SPACING, RADIUS, FONTS, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/theme';

const { width } = Dimensions.get('window');
const FILTERS = ['All', 'Income', 'Expense'];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { transactions, dispatch } = useFinance();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedCat, setSelectedCat] = useState(null);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchType = filter === 'All' || t.type === filter.toLowerCase();
      const matchSearch = !search ||
        t.note?.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCat || t.category === selectedCat;
      return matchType && matchSearch && matchCat;
    });
  }, [transactions, filter, search, selectedCat]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      const key = format(new Date(t.date), 'MMMM d, yyyy');
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return Object.entries(map).map(([date, txns]) => ({ date, txns }));
  }, [filtered]);

  function handleDelete(id) {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_TRANSACTION', payload: id }) },
    ]);
  }

  function renderItem({ item: group }) {
    return (
      <View style={styles.group}>
        <Text style={styles.groupDate}>{group.date}</Text>
        {group.txns.map(txn => (
          <TransactionRow
            key={txn.id}
            txn={txn}
            onEdit={() => nav.navigate('AddTransaction', { mode: 'edit', transaction: txn })}
            onDelete={() => handleDelete(txn.id)}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => nav.navigate('AddTransaction', { mode: 'add' })}
        >
          <Ionicons name="add" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>{filtered.length} transactions</Text>
        <Text style={[styles.summaryAmount, {
          color: filtered.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0) >= 0
            ? COLORS.primary : COLORS.danger
        }]}>
          Net: ${Math.abs(filtered.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0)).toLocaleString()}
        </Text>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState onAdd={() => nav.navigate('AddTransaction', { mode: 'add' })} />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={item => item.date}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: SPACING.lg }}
        />
      )}
    </View>
  );
}

function TransactionRow({ txn, onEdit, onDelete }) {
  const catColor = CATEGORY_COLORS[txn.category] || COLORS.textMuted;
  const icon = CATEGORY_ICONS[txn.category] || 'ellipsis-horizontal';

  return (
    <View style={styles.txnRow}>
      <View style={[styles.txnIcon, { backgroundColor: catColor + '20' }]}>
        <Ionicons name={icon} size={18} color={catColor} />
      </View>
      <View style={styles.txnInfo}>
        <Text style={styles.txnNote} numberOfLines={1}>{txn.note || txn.category}</Text>
        <Text style={styles.txnCat}>{txn.category}</Text>
      </View>
      <View style={styles.txnRight}>
        <Text style={[styles.txnAmount, { color: txn.type === 'income' ? COLORS.primary : COLORS.danger }]}>
          {txn.type === 'income' ? '+' : '-'}${txn.amount.toLocaleString()}
        </Text>
        <View style={styles.txnActions}>
          <TouchableOpacity onPress={onEdit} style={styles.txnAction}>
            <Ionicons name="pencil" size={13} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.txnAction}>
            <Ionicons name="trash" size={13} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ onAdd }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="receipt-outline" size={40} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <Text style={styles.emptySub}>Start tracking your spending</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
        <Text style={styles.emptyBtnText}>Add First Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  title: { fontSize: 26, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  addBtn: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.primaryFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  searchRow: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  filterRow: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.primaryFaint, borderColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: FONTS.medium },
  filterTextActive: { color: COLORS.primary },
  summaryBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 4,
  },
  summaryText: { fontSize: 12, color: COLORS.textMuted },
  summaryAmount: { fontSize: 12, fontWeight: FONTS.bold },
  group: { marginBottom: SPACING.md },
  groupDate: {
    fontSize: 12, color: COLORS.textMuted, fontWeight: FONTS.semiBold,
    letterSpacing: 0.5, marginBottom: 8, marginTop: 4,
  },
  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  txnIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1 },
  txnNote: { fontSize: 14, fontWeight: FONTS.medium, color: COLORS.textPrimary },
  txnCat: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: { fontSize: 15, fontWeight: FONTS.bold },
  txnActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  txnAction: { padding: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 28, backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
  emptyBtn: {
    marginTop: 16, backgroundColor: COLORS.primaryFaint, borderRadius: RADIUS.full,
    paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.primary,
  },
  emptyBtnText: { color: COLORS.primary, fontWeight: FONTS.semiBold, fontSize: 14 },
});
