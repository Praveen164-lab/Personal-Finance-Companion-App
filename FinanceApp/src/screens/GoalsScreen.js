import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFinance } from '../context/FinanceContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import ChallengeCard from '../components/ChallengeCard';

const { width } = Dimensions.get('window');

const GOAL_ICONS = ['flag', 'home', 'car', 'airplane', 'school', 'heart', 'laptop', 'phone-portrait', 'shield-checkmark', 'gift'];
const GOAL_COLORS = [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.danger, '#00BFFF', '#DA70D6', '#3CB371', '#FF7F50'];

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { goals, challenge, dispatch } = useFinance();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', color: COLORS.primary, icon: 'flag' });

  function saveGoal() {
    if (!newGoal.name || !newGoal.target) {
      Alert.alert('Missing Info', 'Please fill in goal name and target amount.');
      return;
    }
    dispatch({
      type: 'ADD_GOAL',
      payload: {
        id: Date.now().toString(),
        name: newGoal.name,
        target: parseFloat(newGoal.target),
        current: parseFloat(newGoal.current) || 0,
        color: newGoal.color,
        icon: newGoal.icon,
      },
    });
    setShowAddGoal(false);
    setNewGoal({ name: '', target: '', current: '', color: COLORS.primary, icon: 'flag' });
  }

  function addToGoal(goal, amount) {
    const updated = { ...goal, current: Math.min(goal.target, goal.current + amount) };
    dispatch({ type: 'UPDATE_GOAL', payload: updated });
  }

  function deleteGoal(id) {
    Alert.alert('Delete Goal?', 'This will remove the goal permanently.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_GOAL', payload: id }) },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Goals</Text>
          <Text style={styles.subtitle}>{goals.length} active goals</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddGoal(true)}>
          <Ionicons name="add" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Challenge section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Current Challenge</Text>
          <ChallengeCard expanded />
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Savings Goals</Text>
          {goals.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="flag-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No goals yet. Add one!</Text>
            </View>
          ) : (
            goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAdd={() => {
                  Alert.prompt?.('Add Funds', 'How much to add?', text => {
                    const n = parseFloat(text);
                    if (!isNaN(n) && n > 0) addToGoal(goal, n);
                  }) || addToGoal(goal, 50);
                }}
                onDelete={() => deleteGoal(goal.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddGoal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Goal</Text>
              <TouchableOpacity onPress={() => setShowAddGoal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Goal name (e.g. Emergency Fund)"
              placeholderTextColor={COLORS.textMuted}
              value={newGoal.name}
              onChangeText={t => setNewGoal(g => ({ ...g, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Target amount ($)"
              placeholderTextColor={COLORS.textMuted}
              value={newGoal.target}
              onChangeText={t => setNewGoal(g => ({ ...g, target: t }))}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Current savings ($) — optional"
              placeholderTextColor={COLORS.textMuted}
              value={newGoal.current}
              onChangeText={t => setNewGoal(g => ({ ...g, current: t }))}
              keyboardType="decimal-pad"
            />

            <Text style={styles.pickerLabel}>Icon</Text>
            <View style={styles.iconPicker}>
              {GOAL_ICONS.map(ic => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconOption, newGoal.icon === ic && { backgroundColor: newGoal.color + '30', borderColor: newGoal.color }]}
                  onPress={() => setNewGoal(g => ({ ...g, icon: ic }))}
                >
                  <Ionicons name={ic} size={18} color={newGoal.icon === ic ? newGoal.color : COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.pickerLabel}>Color</Text>
            <View style={styles.colorPicker}>
              {GOAL_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, newGoal.color === c && styles.colorDotActive]}
                  onPress={() => setNewGoal(g => ({ ...g, color: c }))}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveGoal}>
              <Text style={styles.saveBtnText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function GoalCard({ goal, onAdd, onDelete }) {
  const progress = Math.min(1, goal.current / goal.target);
  const pct = Math.round(progress * 100);

  return (
    <View style={[styles.goalCard, { borderLeftColor: goal.color, borderLeftWidth: 3 }]}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
          <Ionicons name={goal.icon || 'flag'} size={20} color={goal.color} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <Text style={styles.goalAmounts}>
            <Text style={[styles.goalCurrent, { color: goal.color }]}>${goal.current.toLocaleString()}</Text>
            <Text style={styles.goalTarget}> / ${goal.target.toLocaleString()}</Text>
          </Text>
        </View>
        <View style={styles.goalActions}>
          <TouchableOpacity style={styles.goalAdd} onPress={onAdd}>
            <Ionicons name="add" size={16} color={goal.color} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: goal.color }]} />
      </View>
      <View style={styles.goalFooter}>
        <Text style={[styles.goalPct, { color: goal.color }]}>{pct}% complete</Text>
        {pct === 100 && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
            <Text style={styles.completedText}>Goal reached!</Text>
          </View>
        )}
      </View>
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
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.primaryFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  section: { marginBottom: SPACING.lg },
  sectionLabel: {
    fontSize: 12, fontWeight: FONTS.semiBold, color: COLORS.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },
  goalCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  goalIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 15, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  goalAmounts: { marginTop: 2 },
  goalCurrent: { fontSize: 14, fontWeight: FONTS.bold },
  goalTarget: { fontSize: 13, color: COLORS.textSecondary },
  goalActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  goalAdd: {
    width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.primaryFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: {
    height: 6, backgroundColor: COLORS.bgElevated, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  goalPct: { fontSize: 12, fontWeight: FONTS.semiBold },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { fontSize: 12, color: COLORS.primary, fontWeight: FONTS.medium },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary },
  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modal: {
    backgroundColor: '#0F1525', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.lg, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  input: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: 14, color: COLORS.textPrimary, fontSize: 15,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  pickerLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: FONTS.semiBold, marginBottom: 8, marginTop: 4 },
  iconPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  iconOption: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
  },
  colorPicker: { flexDirection: 'row', gap: 12, marginBottom: SPACING.lg },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: COLORS.textPrimary },
  saveBtn: {
    backgroundColor: COLORS.primaryFaint, borderRadius: RADIUS.md,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary,
  },
  saveBtnText: { color: COLORS.primary, fontWeight: FONTS.bold, fontSize: 16 },
});
