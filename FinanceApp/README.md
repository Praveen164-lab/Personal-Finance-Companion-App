# 💰 Finance Companion

A personal finance companion mobile app built with **React Native + Expo**.

## Screenshots & Features

### Design Philosophy
Dark navy + electric mint color palette. Clean cards, purposeful animations, and zero UI clutter. Built mobile-first with real touch affordances.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator — or use **Expo Go** on your phone

### Install & Run

```bash
cd FinanceApp
npm install
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with **Expo Go** app on your phone

---

## 📱 Screens

### 1. Home Dashboard
- Live balance, income, expense, savings metrics
- Weekly spending bar chart
- Category spending pills (horizontal scroll)
- Challenge/streak card
- Recent transactions list
- FAB to add transaction

### 2. Transactions
- Full transaction history, grouped by date
- Search by note or category
- Filter by All / Income / Expense
- Edit and delete support
- Real-time net calculation

### 3. Add/Edit Transaction (Modal)
- Income / Expense toggle
- Large numeric keypad-style amount input
- Category grid with icons and colors
- Notes field
- Date display

### 4. Goals
- Create savings goals with custom icon + color
- Visual progress bars with % complete
- "Add Funds" quick action
- Challenge switcher (No-Spend Weekend, Save 10%, Coffee Cutback)
- Daily streak logging

### 5. Insights
- This Month / Last Month toggle
- Savings Rate KPI
- Month-over-month expense change
- Top spending category highlight
- Weekly spending bar chart
- Category breakdown with proportional bars
- 6-month income vs expenses line chart
- Summary stats grid

---

## 🏗️ Architecture

```
src/
├── context/
│   └── FinanceContext.js     # Global state + AsyncStorage persistence
├── navigation/
│   └── RootNavigator.js      # Bottom tab + stack navigation
├── screens/
│   ├── HomeScreen.js
│   ├── TransactionsScreen.js
│   ├── AddTransactionScreen.js
│   ├── GoalsScreen.js
│   └── InsightsScreen.js
├── components/
│   ├── MiniSpendingChart.js
│   ├── CategoryPills.js
│   ├── RecentTransactions.js
│   └── ChallengeCard.js
└── utils/
    └── theme.js              # Design tokens (colors, spacing, fonts)
```

### State Management
- **React Context + useReducer** — predictable state updates
- **AsyncStorage** — automatic persistence on every state change
- **Computed selectors** — `getBalance()`, `getMonthlyStats()`, `getWeeklyTrend()`, `getCategoryBreakdown()` computed on-demand

### Data Layer
- Local-only (no backend required)
- Seeds with 15 realistic demo transactions on first launch
- All state synced to AsyncStorage automatically

---

## 🎨 Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dark theme only | Finance apps are used at night; dark reduces eye strain |
| Electric mint primary | Positive association with money/growth, high contrast on dark |
| Grouped transaction list | Easier to scan by date than a flat list |
| Category color coding | Instant visual scanning without reading |
| Bottom sheet modal for Add | Native mobile pattern; doesn't break context |
| Seed data on first launch | Shows the app populated and alive from the start |

---

## 📦 Key Dependencies

| Package | Use |
|---------|-----|
| `expo` | Development framework |
| `@react-navigation/native` + tabs + stack | Navigation |
| `react-native-chart-kit` | Bar + Line charts |
| `react-native-svg` | Chart rendering |
| `@react-native-async-storage/async-storage` | Persistence |
| `expo-linear-gradient` | Card gradients |
| `@expo/vector-icons` | Ionicons icon set |
| `date-fns` | Date formatting and calculations |

---

## ✅ Assignment Checklist

- [x] Home Dashboard with balance, income, expenses, savings
- [x] Visual element — weekly spending chart + category pills
- [x] Add / View / Edit / Delete transactions
- [x] Filter and search transactions
- [x] Goal tracking with progress bars
- [x] Challenge feature (No-Spend Weekend, Save 10%, Coffee Cutback) with streaks
- [x] Insights screen with charts and pattern analysis
- [x] Empty states
- [x] Local data persistence (AsyncStorage)
- [x] Clean component architecture with separated concerns
- [x] Reusable components
- [x] Logical state management (Context + useReducer)

---

## 📝 Assumptions

1. **No user accounts** — single user app, all data local
2. **Currency** — USD only (easily extensible)
3. **Date** — transactions default to today; date picker omitted for brevity (can be added with `@react-native-community/datetimepicker`)
4. **Charts** — `react-native-chart-kit` used for simplicity; could swap for `victory-native` for more customization
5. **Streak logging** — manual tap-to-log (no automatic detection from transaction data)
