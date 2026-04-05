import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { COLORS, RADIUS, FONTS, SPACING } from '../utils/theme';

const CHALLENGES = [
  { type: 'no_spend', name: 'No-Spend Weekend', icon: 'ban', color: '#FF5A7E', desc: 'Avoid non-essential purchases for 2 days' },
  { type: 'save_10pct', name: 'Save 10% Challenge', icon: 'trending-up', color: '#00E5A0', desc: 'Save at least 10% of your next paycheck' },
  { type: 'coffee_cut', name: 'Coffee Cutback', icon: 'cafe', color: '#FFB347', desc: 'Skip bought coffee for 7 days and save it' },
];

export default function ChallengeCard({ expanded = false }) {
  const { challenge, dispatch } = useFinance();

  if (!challenge) {
    return (
      <TouchableOpacity
        style={styles.startCard}
        onPress={() => dispatch({
          type: 'SET_CHALLENGE',
          payload: { ...CHALLENGES[0], streak: 0, active: true, startDate: new Date().toISOString(), duration: 2 },
        })}
      >
        <Ionicons name="flash" size={20} color={COLORS.warning} />
        <View style={{ flex: 1 }}>
          <Text style={styles.startTitle}>Start a Challenge</Text>
          <Text style={styles.startSub}>Boost your savings habits</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }

  const chDef = CHALLENGES.find(c => c.type === challenge.type) || CHALLENGES[0];

  return (
    <LinearGradient
      colors={[chDef.color + '22', COLORS.bgCard]}
      style={[styles.card, expanded && styles.cardExpanded]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.icon, { backgroundColor: chDef.color + '25' }]}>
          <Ionicons name={chDef.icon} size={20} color={chDef.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{challenge.name || chDef.name}</Text>
          <Text style={styles.desc}>{chDef.desc}</Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: chDef.color + '20', borderColor: chDef.color + '50' }]}>
          <Text style={[styles.streakNum, { color: chDef.color }]}>{challenge.streak || 0}</Text>
          <Text style={[styles.streakLabel, { color: chDef.color }]}>day{challenge.streak !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.actionsRow}>
            {CHALLENGES.map(ch => (
              <TouchableOpacity
                key={ch.type}
                style={[styles.switchBtn, challenge.type === ch.type && { borderColor: ch.color, backgroundColor: ch.color + '15' }]}
                onPress={() => dispatch({
                  type: 'SET_CHALLENGE',
                  payload: { ...ch, streak: challenge.streak || 0, active: true, startDate: new Date().toISOString(), duration: 2 },
                })}
              >
                <Ionicons name={ch.icon} size={14} color={challenge.type === ch.type ? ch.color : COLORS.textMuted} />
                <Text style={[styles.switchBtnText, challenge.type === ch.type && { color: ch.color }]}>
                  {ch.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.logBtn}
            onPress={() => dispatch({ type: 'UPDATE_CHALLENGE', payload: { streak: (challenge.streak || 0) + 1 } })}
          >
            <Ionicons name="checkmark-circle" size={16} color={chDef.color} />
            <Text style={[styles.logBtnText, { color: chDef.color }]}>Log Today's Success +1</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  startCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  startTitle: { fontSize: 14, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  startSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  card: {
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardExpanded: { padding: SPACING.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  desc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  streakBadge: {
    alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  streakNum: { fontSize: 20, fontWeight: FONTS.bold },
  streakLabel: { fontSize: 10, fontWeight: FONTS.medium },
  expandedSection: { marginTop: SPACING.md, gap: SPACING.sm },
  actionsRow: { flexDirection: 'row', gap: 8 },
  switchBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bgElevated,
  },
  switchBtnText: { fontSize: 12, color: COLORS.textMuted, fontWeight: FONTS.medium },
  logBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  logBtnText: { fontSize: 14, fontWeight: FONTS.semiBold },
});
