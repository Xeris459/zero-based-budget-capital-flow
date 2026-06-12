export interface Bank {
  id: string
  name: string
  code: string
  color: string
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit_card' | 'cash'
  bankId: string
  startingBalance: number
  balance: number
}

export interface Category {
  id: string
  name: string
  parentId: 'income' | 'expenses' | 'savings' | 'debt'
}

export interface Budget {
  month: string
  categoryId: string
  planned: number
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  accountId: string
  categoryId: string
  shiftToNextMonth: boolean
  transferId?: string
}

export interface AppState {
  banks: Bank[]
  accounts: Account[]
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
}

export interface SettingsState {
  kMode: boolean
  currentMonth: string
  currentYear: string
  currencySymbol: string
  warningThreshold: number
  glowEffects: boolean
  isSidebarCollapsed: boolean
  isTauri: boolean
  filterType: 'monthly' | 'yearly'
  plannerView: 'monthly' | 'yearly'
  maxDebtLimit: number
  minSavingsRate: number
  lowCashThreshold: number
}

export interface SecurityConfig {
  passwordEnabled: boolean
  pinEnabled: boolean
  patternEnabled: boolean
  fingerprintEnabled: boolean
  faceEnabled: boolean
  passwordVal: string
  pinVal: string
  patternVal: string
}

export interface SecurityState {
  isLocked: boolean
  isPinSetupRequired: boolean
  security: SecurityConfig
}
