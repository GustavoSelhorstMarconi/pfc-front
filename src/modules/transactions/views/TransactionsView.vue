<template>
  <div class="transactions-view">
    <h1>Transações</h1>

    <button class="add-button" @click="openCreateModal">
      Adicionar Nova Transação
    </button>

    <div class="transactions-grid">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div v-for="transaction in transactions" :key="transaction.id" class="transaction-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">
                {{ transaction.description || 'Sem descrição' }}
              </h3>

              <span class="type-badge" :class="transaction.type === 0 ? 'income' : 'expense'">
                {{ formatType(transaction.type) }}
              </span>
            </div>

            <span class="status-badge" :class="transaction.isActive ? 'active' : 'inactive'">
              {{ transaction.isActive ? 'Ativa' : 'Inativa' }}
            </span>
          </div>

          <div class="amount" :class="transaction.type === 0 ? 'income' : 'expense'">
            {{ formatCurrency(transaction.amount) }}
          </div>

          <div class="transaction-grid">
            <div>
              <span class="label">Data</span>
              <span class="value">
                {{ formatDate(transaction.date) }}
              </span>
            </div>

            <div>
              <span class="label">Conta</span>
              <span class="value">
                {{ getAccountName(transaction.accountId) }}
              </span>
            </div>

            <div>
              <span class="label">Categoria</span>
              <span class="value">
                {{ getCategoryName(transaction.categoryId) }}
              </span>
            </div>

            <div v-if="transaction.goalId">
              <span class="label">Meta</span>
              <span class="value">Vinculada</span>
            </div>

            <div v-if="transaction.debtId">
              <span class="label">Dívida</span>
              <span class="value">Vinculada</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="edit-button" @click="editTransaction(transaction)">
              Editar
            </button>

            <button class="delete-button" @click="askDelete(transaction.id)">
              Excluir
            </button>
          </div>
        </div>
      </template>
    </div>

    <TransactionModal :show="showModal" :transaction="selectedTransaction" :accounts="accounts || []"
      :categories="categories || []" :goals="goals || []" :debts="debts || []" @close="showModal = false"
      @save="handleSave" />
    <ConfirmModal :show="showDeleteModal" title="Excluir transação" message="Esta ação não pode ser desfeita."
      @cancel="showDeleteModal = false" @confirm="confirmDelete" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

import { accountService } from '@/modules/accounts/services/account.service';
import { categoryService } from '@/modules/categories/services/category.service';
import { transactionService } from '../services/transaction.service';

import ConfirmModal from '@/shared/components/ConfirmModal.vue';
import TransactionModal from '../components/TransactionModal.vue';

import type {
  CreateTransactionRequest,
  TransactionResponse,
  UpdateTransactionRequest,
} from '../types/transaction.types';

import type { AccountResponse } from '@/modules/accounts/types/account.types';
import type { CategoryResponse } from '@/modules/categories/types/category.types';
import { debtService } from '@/modules/debts/services/debt.service';
import type { DebtResponse } from '@/modules/debts/types/debt.types';
import { goalService } from '@/modules/goals/services/goal.service';
import type { GoalResponse } from '@/modules/goals/types/goal.types';

const transactions = ref<TransactionResponse[]>([]);
const showModal = ref(false);
const selectedTransaction = ref<TransactionResponse | null>(null);
const showDeleteModal = ref(false);
const transactionToDelete = ref<string | null>(null);

const {
  execute: getTransactions,
  data,
  loading,
  error: errorGet,
} = useApi<TransactionResponse[]>(() => transactionService.get());

const {
  execute: createTransaction,
  data: createdTransaction,
  error: errorCreate,
} = useApi<TransactionResponse, CreateTransactionRequest>((r) =>
  transactionService.create(r),
);

const {
  execute: updateTransaction,
  data: updatedTransaction,
  error: errorUpdate,
} = useApi<TransactionResponse, UpdateTransactionRequest>((r) =>
  transactionService.update(r.id, r),
);

const {
  execute: deleteTransaction,
  error: errorDelete,
} = useApi<void, string>((id) =>
  transactionService.delete(id),
);

const {
  execute: getAccounts,
  data: accounts,
} = useApi<AccountResponse[]>(() => accountService.get());

const {
  execute: getCategories,
  data: categories,
} = useApi<CategoryResponse[]>(() => categoryService.get());

const {
  execute: getGoals,
  data: goals,
} = useApi<GoalResponse[]>(() => goalService.get());

const {
  execute: getDebts,
  data: debts,
} = useApi<DebtResponse[]>(() => debtService.get());

const handleGet = async () => {
  await getTransactions();

  if (data.value) transactions.value = data.value;

  if (errorGet.value) {
    toast.error('Erro ao carregar transações');
  }
};

const handleSave = async (
  form: CreateTransactionRequest | UpdateTransactionRequest,
) => {
  if ('id' in form) {
    await updateTransaction(form);

    if (errorUpdate.value) {
      toast.error('Erro ao atualizar transação: ' + (errorUpdate.value?.detail ?? 'Erro desconhecido'));
    } else if (updatedTransaction.value) {
      toast.success('Transação atualizada!');
      showModal.value = false;
      selectedTransaction.value = null;
      await handleGet();
    }
  } else {
    await createTransaction(form);

    if (errorCreate.value) {
      toast.error('Erro ao criar transação: ' + (errorCreate.value?.detail ?? 'Erro desconhecido'));

    } else if (createdTransaction.value) {
      toast.success('Transação criada!');
      showModal.value = false;
      selectedTransaction.value = null;
      await handleGet();
    }
  }
};

const askDelete = (id: string) => {
  transactionToDelete.value = id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!transactionToDelete.value) return;

  await deleteTransaction(transactionToDelete.value);

  if (errorDelete.value) {
    toast.error('Erro ao excluir transação' + (errorDelete.value?.detail ?? 'Erro desconhecido'));
  } else {
    toast.success('Transação excluída!');
    showDeleteModal.value = false;
    await handleGet();
  }
};

const openCreateModal = () => {
  selectedTransaction.value = null;
  showModal.value = true;
};

const editTransaction = (transaction: TransactionResponse) => {
  selectedTransaction.value = transaction;
  showModal.value = true;
};

const getAccountName = (accountId: string) =>
  accounts.value?.find(a => a.id === accountId)?.name ?? '—';

const getCategoryName = (categoryId: string) =>
  categories.value?.find(c => c.id === categoryId)?.name ?? '—';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatDate = (date: string) =>
  date?.split('T')[0]?.split('-').reverse().join('/');

const formatType = (type: number) =>
  type === 0 ? 'Receita' : 'Despesa';

onMounted(async () => {
  await Promise.all([
    handleGet(),
    getAccounts(),
    getCategories(),
    getGoals(),
    getDebts(),
  ]);
});
</script>

<style scoped>
.transactions-view {
  padding: 2rem;
  color: #cbd5e1;
  width: 100%;
}

h1 {
  color: #3b82f6;
  margin-bottom: 20px;
}

.add-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  border-radius: 6px;
}

.transactions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.transaction-card {
  width: 320px;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.transaction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.type-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  display: inline-block;
}

.type-badge.income {
  background-color: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.type-badge.expense {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.amount {
  font-size: 22px;
  font-weight: 700;
}

.amount.income {
  color: #22c55e;
}

.amount.expense {
  color: #ef4444;
}

.transaction-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.label {
  font-size: 11px;
  color: #94a3b8;
  display: block;
  margin-bottom: 2px;
}

.value {
  font-size: 14px;
  font-weight: 500;
}

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.status-badge.active {
  background-color: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge.inactive {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.card-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
}

.edit-button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  transition: background 0.2s ease;
}

.edit-button:hover {
  background-color: #1d4ed8;
}

.delete-button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: #ef4444;
  color: white;
  font-weight: 600;
  transition: background 0.2s ease;
}

.delete-button:hover {
  background-color: #dc2626;
}
</style>
