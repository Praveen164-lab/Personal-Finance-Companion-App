import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import {
  COLORS, SPACING, RADIUS, FONTS,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES,
  CATEGORY_COLORS, CATEGORY_ICONS,
} from '../utils/theme';

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const route = useRoute();
  const { dispatch } = useFinance();

  const mode = route.params?.mode || 'add';
  const existing = route.params?.transaction;

  const [type, setType] = useState(existing?.type || 'expense');
  const [amount, setAmount] = useState(existing?.amount?.toString() || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [note, setNote] = useState(existing?.note || '');
  const [date, setDate] = useState(existing?.date || new Date().toISOString());

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleSave() {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }
    if (!category) {
      Alert.alert('No Category', 'Please select a category.');
      return;
    }

    const txn = {
      id: existing?.id || Date.now().toString(),
      amount: parseFloat(amount),
      type,
      category,
      note,
      date,
    };

    if (mode === 'edit') {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: txn });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: txn });
    }
    nav.goBack();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Handle */}
      <View style={styles.handle} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{mode === 'edit' ? 'Edit Transaction' : 'New Transaction'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Type toggle */}
        <View style={styles.typeToggle}>
          {['expense', 'income'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && (t === 'income' ? styles.typeBtnIncome : styles.typeBtnExpense)]}
              onPress={() => { setType(t); setCategory(''); }}
            >
              <Ionicons
                name={t === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={16}
                color={type === t ? (t === 'income' ? COLORS.primary : COLORS.danger) : COLORS.textMuted}
              />
              <Text style={[
                styles.typeBtnText,
                type === t && { color: t === 'income' ? COLORS.primary : COLORS.danger }
              ]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            autoFocus={mode === 'add'}
          />
        </View>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => {
            const color = CATEGORY_COLORS[cat] || COLORS.textMuted;
            const icon = CATEGORY_ICONS[cat] || 'ellipsis-horizontal';
            const selected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, selected && { borderColor: color, backgroundColor: color + '18' }]}
                onPress={() => setCategory(cat)}
              >
                <Ionicons name={icon} size={15} color={selected ? color : COLORS.textSecondary} />
                <Text style={[styles.catChipText, selected && { color }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={200}
        />

        {/* Date info */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{format(new Date(date), 'MMMM d, yyyy')}</Text>
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient
            colors={type === 'income' ? [COLORS.primary, COLORS.primaryDim] : ['#FF5A7E', '#CC3C5C']}
            style={styles.saveBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Ionicons name={mode === 'edit' ? 'checkmark-circle' : 'add-circle'} size={20} color={COLORS.bg} />
            <Text style={styles.saveBtnText}>
              {mode === 'edit' ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1525', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: 'center', marginTop: 12,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  typeToggle: {
    flexDirection: 'row', gap: 12, marginBottom: SPACING.lg,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: 4,
  },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: RADIUS.sm,
  },
  typeBtnIncome: { backgroundColor: COLORS.primaryFaint },
  typeBtnExpense: { backgroundColor: COLORS.dangerFaint },
  typeBtnText: { fontSize: 14, fontWeight: FONTS.semiBold, color: COLORS.textMuted, textTransform: 'capitalize' },
  amountContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  currencySymbol: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.textSecondary, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  label: { fontSize: 13, fontWeight: FONTS.semiBold, color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.3 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  catChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: FONTS.medium },
  noteInput: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, color: COLORS.textPrimary, fontSize: 15,
    minHeight: 80, borderWidth: 1, borderColor: COLORS.border,
    textAlignVertical: 'top', marginBottom: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: SPACING.sm, marginBottom: SPACING.lg,
  },
  dateText: { fontSize: 14, color: COLORS.textSecondary },
  saveBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
  saveBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  saveBtnText: { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.bg },
});
