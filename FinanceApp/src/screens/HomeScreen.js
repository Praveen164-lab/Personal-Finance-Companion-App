import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import MiniSpendingChart from '../components/MiniSpendingChart';
import CategoryPills from '../components/CategoryPills';
import RecentTransactions from '../components/RecentTransactions';
import ChallengeCard from '../components/ChallengeCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { getBalance, getMonthlyStats, transactions, challenge } = useFinance();
  const scrollY = useRef(new Animated.Value(0)).current;

  const balance = getBalance();
  const { income, expenses, savings } = getMonthlyStats();
  const recentTxns = transactions.slice(0, 5);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Ambient glow */}
      <View style={styles.glowTop} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* Balance Hero Card */}
        <LinearGradient
          colors={['#1A2C3D', '#0F1D2E', '#0A0E1A']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Total Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.balanceSub}>
            {balance >= 0 ? '↑ Positive cashflow' : '↓ Negative cashflow'}
          </Text>

          {/* Stat row */}
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.primaryFaint }]}>
                <Ionicons name="arrow-down" size={14} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={[styles.statAmount, { color: COLORS.primary }]}>
                  ${income.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.dangerFaint }]}>
                <Ionicons name="arrow-up" size={14} color={COLORS.danger} />
              </View>
              <View>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={[styles.statAmount, { color: COLORS.danger }]}>
                  ${expenses.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.accentFaint }]}>
                <Ionicons name="wallet" size={14} color={COLORS.accent} />
              </View>
              <View>
                <Text style={styles.statLabel}>Saved</Text>
                <Text style={[styles.statAmount, { color: COLORS.accent }]}>
                  ${Math.max(0, savings).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { label: 'Add', icon: 'add-circle', color: COLORS.primary, action: () => nav.navigate('Transactions', { screen: 'AddTransaction', params: { mode: 'add' } }) },
            { label: 'History', icon: 'time', color: COLORS.accent, action: () => nav.navigate('Transactions') },
            { label: 'Goals', icon: 'flag', color: COLORS.warning, action: () => nav.navigate('Goals') },
            { label: 'Insights', icon: 'analytics', color: COLORS.danger, action: () => nav.navigate('Insights') },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.quickBtn} onPress={item.action}>
              <View style={[styles.quickBtnIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.quickBtnLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly spending chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Spending</Text>
            <TouchableOpacity onPress={() => nav.navigate('Insights')}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <MiniSpendingChart />
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <CategoryPills />
        </View>

        {/* Challenge card */}
        {challenge && (
          <View style={styles.section}>
            <ChallengeCard />
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <TouchableOpacity onPress={() => nav.navigate('Transactions')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <RecentTransactions transactions={recentTxns} />
        </View>
      </Animated.ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => nav.navigate('Transactions', { screen: 'AddTransaction', params: { mode: 'add' } })}
      >
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDim]} style={styles.fabGrad}>
          <Ionicons name="add" size={28} color={COLORS.bg} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  glowTop: {
    position: 'absolute', top: -100, left: width / 2 - 150,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: COLORS.primary, opacity: 0.04,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  greeting: { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  date: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: { padding: 8, position: 'relative' },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger,
    borderWidth: 1.5, borderColor: COLORS.bg,
  },
  balanceCard: {
    mx: SPACING.lg, marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 6 },
  badgeText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: FONTS.medium, letterSpacing: 0.5 },
  balanceAmount: { fontSize: 40, fontWeight: FONTS.bold, color: COLORS.textPrimary, letterSpacing: -1 },
  balanceSub: { fontSize: 13, color: COLORS.primary, marginTop: 4, marginBottom: SPACING.md },
  statRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.md, padding: SPACING.md, marginTop: 4,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary },
  statAmount: { fontSize: 14, fontWeight: FONTS.bold, marginTop: 1 },
  quickActions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginBottom: SPACING.sm,
  },
  quickBtn: { alignItems: 'center', gap: 6 },
  quickBtnIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quickBtnLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: FONTS.medium },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: 17, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  seeAll: { fontSize: 13, color: COLORS.primary },
  fab: {
    position: 'absolute', bottom: 90, right: SPACING.lg,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12,
    elevation: 10,
  },
  fabGrad: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
});
