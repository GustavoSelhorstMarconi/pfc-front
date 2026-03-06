import { AccountType } from '@/modules/accounts/types/account.types';
import { TransactionType } from '@/modules/transactions/types/transaction.types';

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatCurrencyCompact = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value);

export const formatDate = (date: string): string =>
  date?.split('T')[0]?.split('-').reverse().join('/') ?? '';

export const formatDateToInput = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseCurrencyInput = (event: Event): number => {
  const input = event.target as HTMLInputElement;
  return Number(input.value.replace(/\D/g, '')) / 100;
};

export const formatTransactionType = (type: number): string =>
  type === 0 ? 'Receita' : 'Despesa';

export const formatAccountType = (type: AccountType): string => {
  switch (type) {
    case AccountType.Checking: return 'Corrente';
    case AccountType.Wallet: return 'Carteira';
    case AccountType.CreditCard: return 'Cartão de crédito';
    case AccountType.Investment: return 'Investimentos';
    default: return '';
  }
};

export const formatCategoryType = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.Income: return 'Receita';
    case TransactionType.Expense: return 'Despesa';
    default: return '';
  }
};

export const formatFrequency = (frequency: number): string => {
  switch (frequency) {
    case 0: return 'Diária';
    case 1: return 'Semanal';
    case 2: return 'Mensal';
    case 3: return 'Anual';
    default: return '';
  }
};

export const formatInterest = (value?: number): string => {
  if (value === undefined || value === null) return '';
  return `${value.toFixed(2)}% a.m.`;
};
