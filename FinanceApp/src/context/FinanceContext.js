import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const STORAGE_KEY = '@finance_data_v1';

const initialState = {
  transactions: [],
  goals: [],
  challenge: null,
  isLoaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload, isLoaded: true };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'SET_CHALLENGE':
      return { ...state, challenge: action.payload };
    case 'UPDATE_CHALLENGE':
      return { ...state, challenge: { ...state.challenge, ...action.payload } };
    default:
      return state;
  }
}

const FinanceContext = createContext(null);

// Seed data for demo
const seedTransactions = () => {
  const now = new Date();
  const d = (daysAgo) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };
  return [
    { id: '1', amount: 3500, type: 'income', category: 'Salary', note: 'Monthly salary', date: d(2) },
    { id: '2', amount: 80, type: 'expense', category: 'Food', note: 'Grocery store', date: d(1) },
    { id: '3', amount: 45, type: 'expense', category: 'Transport', note: 'Uber rides', date: d(1) },
    { id: '4', amount: 200, type: 'expense', category: 'Shopping', note: 'New shoes', date: d(3) },
    { id: '5', amount: 15, type: 'expense', category: 'Food', note: 'Coffee & snacks', date: d(3) },
    { id: '6', amount: 120, type: 'expense', category: 'Bills', note: 'Electric bill', date: d(5) },
    { id: '7', amount: 500, type: 'income', category: 'Freelance', note: 'Logo design project', date: d(6) },
    { id: '8', amount: 60, type: 'expense', category: 'Entertainment', note: 'Netflix + Spotify', date: d(7) },
    { id: '9', amount: 35, type: 'expense', category: 'Health', note: 'Pharmacy', date: d(8) },
    { id: '10', amount: 180, type: 'expense', category: 'Food', note: 'Restaurant dinner', date: d(9) },
    { id: '11', amount: 250, type: 'income', category: 'Freelance', note: 'Consulting call', date: d(12) },
    { id: '12', amount: 90, type: 'expense', category: 'Transport', note: 'Monthly metro pass', date: d(14) },
    { id: '13', amount: 300, type: 'expense', category: 'Shopping', note: 'Home decor', date: d(15) },
    { id: '14', amount: 40, type: 'expense', category: 'Food', note: 'Meal prep', date: d(16) },
    { id: '15', amount: 1000, type: 'income', category: 'Investment', note: 'Dividend payout', date: d(20) },
  ];
};

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (state.isLoaded) persistData();
  }, [state.transactions, state.goals, state.challenge]);

  async function loadData() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: 'LOAD', payload: JSON.parse(raw) });
      } else {
        // Seed with demo data
        const seed = {
          transactions: seedTransactions(),
          goals: [
            { id: 'g1', name: 'Emergency Fund', target: 5000, current: 1800, color: '#00E5A0', icon: 'shield-checkmark' },
            { id: 'g2', name: 'New Laptop', target: 1500, current: 600, color: '#7C6EF8', icon: 'laptop' },
          ],
          challenge: {
            type: 'no_spend',
            name: 'No-Spend Weekend',
            startDate: new Date().toISOString(),
            duration: 2,
            streak: 3,
            active: true,
          },
        };
        dispatch({ type: 'LOAD', payload: seed });
      }
    } catch (e) {
      dispatch({ type: 'LOAD', payload: {} });
    }
  }

  async function persistData() {
    try {
      const { isLoaded, ...toSave } = state;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {}
  }

  // Computed values
  const getBalance = () => {
    return state.transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  };

  const getMonthlyStats = (date = new Date()) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthly = state.transactions.filter(t =>
      isWithinInterval(new Date(t.date), { start, end })
    );
    const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, savings: income - expenses, transactions: monthly };
  };

  const getWeeklyTrend = () => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const refDate = subMonths(new Date(), 0);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const expenses = state.transactions
        .filter(t => t.type === 'expense' && isWithinInterval(new Date(t.date), { start: weekStart, end: weekEnd }))
        .reduce((s, t) => s + t.amount, 0);
      weeks.push({ label: `W${4 - i}`, amount: expenses });
    }
    return weeks;
  };

  const getCategoryBreakdown = (type = 'expense') => {
    const current = getMonthlyStats();
    const filtered = current.transactions.filter(t => t.type === type);
    const map = {};
    filtered.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([cat, amount]) => ({ category: cat, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  return (
    <FinanceContext.Provider value={{
      ...state,
      dispatch,
      getBalance,
      getMonthlyStats,
      getWeeklyTrend,
      getCategoryBreakdown,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
