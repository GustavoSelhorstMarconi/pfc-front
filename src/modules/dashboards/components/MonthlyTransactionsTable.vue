<template>
  <div class="table-card">
    <div class="table-header">
      <h3 class="table-title">Extrato Mensal</h3>
      <span class="total-badge">{{ totalTransactions }} transações</span>
    </div>

    <div v-if="sortedMonths.length === 0" class="empty-state">
      Nenhuma transação no período
    </div>

    <div v-else class="months-wrapper">
      <div class="months-grid">
        <div
          v-for="monthData in sortedMonths"
          :key="`${monthData.year}-${monthData.month}`"
          class="month-column"
        >
          <div class="month-header">
            <span class="month-name">{{ formatMonthYear(monthData.month, monthData.year) }}</span>
            <span class="month-count">{{ monthData.transactions.length }}</span>
          </div>

          <div class="transaction-list">
            <div v-if="monthData.transactions.length === 0" class="no-transactions">
              Sem transações
            </div>

            <div
              v-for="tx in sortByDate(monthData.transactions)"
              :key="tx.id"
              class="transaction-row"
            >
              <div class="tx-top">
                <span class="tx-date">{{ formatDayMonth(tx.date) }}</span>
                <span class="tx-amount" :class="tx.type === 0 ? 'income' : 'expense'">
                  {{ tx.type === 0 ? '+' : '−' }}{{ formatCurrency(tx.amount) }}
                </span>
              </div>

              <div class="tx-category">{{ tx.categoryName }}</div>

              <div class="tx-bottom">
                <span class="tx-account">{{ tx.accountName }}</span>
                <span v-if="tx.description" class="tx-description">{{ tx.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/shared/utils/formatters';
import { computed } from 'vue';
import type { TransactionItem, TransactionsByMonthResponse } from '../types/dashboard.types';

const props = defineProps<{
  data: TransactionsByMonthResponse[];
}>();

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const sortedMonths = computed(() =>
  [...props.data].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  )
);

const totalTransactions = computed(() =>
  props.data.reduce((sum, m) => sum + m.transactions.length, 0)
);

const formatMonthYear = (month: number, year: number): string =>
  `${MONTH_NAMES[month - 1]}/${String(year).slice(2)}`;

const formatDayMonth = (date: string): string => {
  const [, m, d] = date.split('-');
  return `${d}/${m}`;
};

const sortByDate = (transactions: TransactionItem[]): TransactionItem[] =>
  [...transactions].sort((a, b) => a.date.localeCompare(b.date));
</script>

<style scoped>
.table-card {
  width: 100%;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
}

.total-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  font-weight: 600;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #64748b;
  font-size: 14px;
}

.months-wrapper {
  overflow-x: auto;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(var(--month-count, 4), minmax(200px, 1fr));
  gap: 0;
  min-width: 0;
}

.month-column {
  border-right: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.month-column:last-child {
  border-right: none;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid #1e293b;
  position: sticky;
  top: 0;
}

.month-name {
  font-size: 13px;
  font-weight: 700;
  color: #cbd5e1;
  letter-spacing: 0.02em;
}

.month-count {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: rgba(100, 116, 139, 0.2);
  color: #64748b;
  font-weight: 600;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 420px;
}

.no-transactions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #475569;
  font-size: 13px;
}

.transaction-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(30, 41, 59, 0.8);
  transition: background-color 0.15s ease;
  cursor: default;
}

.transaction-row:last-child {
  border-bottom: none;
}

.transaction-row:hover {
  background-color: rgba(30, 41, 59, 0.6);
}

.tx-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.tx-date {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.tx-amount {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.tx-amount.income {
  color: #22c55e;
}

.tx-amount.expense {
  color: #ef4444;
}

.tx-category {
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-account {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-description {
  font-size: 11px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}

.months-wrapper::-webkit-scrollbar,
.transaction-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.months-wrapper::-webkit-scrollbar-track,
.transaction-list::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 3px;
}

.months-wrapper::-webkit-scrollbar-thumb,
.transaction-list::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

.months-wrapper::-webkit-scrollbar-thumb:hover,
.transaction-list::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

.months-wrapper::-webkit-scrollbar-corner,
.transaction-list::-webkit-scrollbar-corner {
  background: rgba(15, 23, 42, 0.6);
}
</style>
