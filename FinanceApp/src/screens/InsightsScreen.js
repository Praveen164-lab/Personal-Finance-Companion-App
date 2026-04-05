import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { format, subMonths } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { COLORS, SPACING, RADIUS, FONTS, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/theme';

const { width } = Dimensions.get('window');
const CHART_W = width - SPACING.lg * 2;

const chartConfig = {
  backgroundGradientFrom: COLORS.bgCard,
  backgroundGradientTo: COLORS.bgCard,
  color: (opacity = 1) => `rgba(0, 229, 160, ${opacity})`,
  labelColor: () => COLORS.textSecondary,
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 0,
  propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary },
  propsForLabels: { fontSize: 11 },
};

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { getMonthlyStats, getWeeklyTrend, getCategoryBreakdown, transactions } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = current, 1 = last

  const currMonth = getMonthlyStats(subMonths(new Date(), selectedMonth));
  const prevMonth = getMonthlyStats(subMonths(new Date(), selectedMonth + 1));
  const weeklyTrend = getWeeklyTrend();
  const categoryBreakdown = getCategoryBreakdown('expense');
  const topCat = categoryBreakdown[0];

  const weeklyData = {
    labels: weeklyTrend.map(w => w.label),
    datasets: [{ data: weeklyTrend.map(w => w.amount || 0) }],
  };

  // 6-month comparison
  const monthlyData = {
    labels: Array.from({ length: 6 }, (_, i) => format(subMonths(new Date(), 5 - i), 'MMM')),
    datasets: [
      {
        data: Array.from({ length: 6 }, (_, i) => getMonthlyStats(subMonths(new Date(), 5 - i)).expenses),
        color: () => COLORS.danger,
      },
      {
        data: Array.from({ length: 6 }, (_, i) => getMonthlyStats(subMonths(new Date(), 5 - i)).income),
        color: () => COLORS.primary,
      },
    ],
    legend: ['Expenses', 'Income'],
  };

  const savingsRate = currMonth.income > 0
    ? Math.round((currMonth.savings / currMonth.income) * 100)
    : 0;

  const expenseChange = prevMonth.expenses > 0
    ? Math.round(((currMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100)
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <View style={styles.monthToggle}>
          {['This Month', 'Last Month'].map((label, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.monthBtn, selectedMonth === i && styles.monthBtnActive]}
              onPress={() => setSelectedMonth(i)}
            >
              <Text style={[styles.monthBtnText, selectedMonth === i && styles.monthBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* KPI cards */}
        <View style={styles.kpiRow}>
          <KPICard
            label="Savings Rate"
            value={`${savingsRate}%`}
            icon="trending-up"
            color={savingsRate >= 20 ? COLORS.primary : COLORS.warning}
            sub={savingsRate >= 20 ? 'Great job!' : 'Aim for 20%'}
          />
          <KPICard
            label="vs Last Month"
            value={`${expenseChange > 0 ? '+' : ''}${expenseChange}%`}
            icon="swap-vertical"
            color={expenseChange <= 0 ? COLORS.primary : COLORS.danger}
            sub={expenseChange <= 0 ? 'Spending down' : 'Spending up'}
          />
        </View>

        {/* Top category highlight */}
        {topCat && (
          <View style={styles.topCatCard}>
            <View style={[styles.topCatIcon, { backgroundColor: (CATEGORY_COLORS[topCat.category] || COLORS.accent) + '20' }]}>
              <Ionicons name={CATEGORY_ICONS[topCat.category] || 'ellipsis-horizontal'} size={22} color={CATEGORY_COLORS[topCat.category] || COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.topCatLabel}>Top spending category</Text>
              <Text style={styles.topCatName}>{topCat.category}</Text>
            </View>
            <Text style={[styles.topCatAmount, { color: CATEGORY_COLORS[topCat.category] || COLORS.accent }]}>
              ${topCat.amount.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Weekly trend bar chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Spending</Text>
          <BarChart
            data={weeklyData}
            width={CHART_W - 32}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: () => COLORS.accent,
              fillShadowGradientFrom: COLORS.accent,
              fillShadowGradientTo: COLORS.accent + '40',
            }}
            style={{ borderRadius: 8, marginTop: 8 }}
            showValuesOnTopOfBars
            fromZero
            withInnerLines={false}
          />
        </View>

        {/* Category breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          {categoryBreakdown.length === 0 ? (
            <Text style={styles.noData}>No expense data</Text>
          ) : (
            categoryBreakdown.map(item => {
              const pct = currMonth.expenses > 0 ? (item.amount / currMonth.expenses) * 100 : 0;
              const color = CATEGORY_COLORS[item.category] || COLORS.textMuted;
              return (
                <View key={item.category} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <Text style={styles.catName}>{item.category}</Text>
                  <View style={styles.catBarTrack}>
                    <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.catAmt, { color }]}>${item.amount.toLocaleString()}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* 6-month line chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>6-Month Overview</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
          </View>
          <LineChart
            data={monthlyData}
            width={CHART_W - 32}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 8, marginTop: 8 }}
            withInnerLines={false}
            withDots
          />
        </View>

        {/* Quick stats */}
        <View style={styles.statsGrid}>
          <StatBox label="Transactions" value={transactions.length} icon="receipt" />
          <StatBox label="Avg. Expense" value={`$${categoryBreakdown.length ? Math.round(currMonth.expenses / Math.max(1, currMonth.transactions?.filter(t => t.type === 'expense').length)) : 0}`} icon="calculator" />
          <StatBox label="Income Sources" value={[...new Set(transactions.filter(t => t.type === 'income').map(t => t.category))].length} icon="briefcase" />
          <StatBox label="Categories Used" value={categoryBreakdown.length} icon="grid" />
        </View>
      </ScrollView>
    </View>
  );
}

function KPICard({ label, value, icon, color, sub }) {
  return (
    <View style={[styles.kpiCard, { borderColor: color + '30' }]}>
      <View style={[styles.kpiIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiSub}>{sub}</Text>
    </View>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={16} color={COLORS.textMuted} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  title: { fontSize: 26, fontWeight: FONTS.bold, color: COLORS.textPrimary, marginBottom: 12 },
  monthToggle: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md, padding: 3, alignSelf: 'flex-start',
  },
  monthBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.sm },
  monthBtnActive: { backgroundColor: COLORS.primaryFaint },
  monthBtnText: { fontSize: 13, color: COLORS.textMuted, fontWeight: FONTS.medium },
  monthBtnTextActive: { color: COLORS.primary },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: 14, borderWidth: 1, alignItems: 'flex-start', gap: 4,
  },
  kpiIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: FONTS.bold },
  kpiLabel: { fontSize: 12, color: COLORS.textSecondary },
  kpiSub: { fontSize: 11, color: COLORS.textMuted },
  topCatCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  topCatIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  topCatLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  topCatName: { fontSize: 16, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  topCatAmount: { fontSize: 18, fontWeight: FONTS.bold },
  chartCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  chartTitle: { fontSize: 15, fontWeight: FONTS.semiBold, color: COLORS.textPrimary },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: 13, color: COLORS.textSecondary, width: 90 },
  catBarTrack: { flex: 1, height: 6, backgroundColor: COLORS.bgElevated, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },
  catAmt: { fontSize: 13, fontWeight: FONTS.bold, width: 60, textAlign: 'right' },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: COLORS.textSecondary },
  noData: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12,
  },
  statBox: {
    width: (width - SPACING.lg * 2 - 10) / 2,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
});
