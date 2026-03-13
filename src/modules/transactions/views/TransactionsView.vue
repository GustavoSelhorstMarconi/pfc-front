<template>
  <div class="transactions-view">
    <h1>Transações</h1>

    <div class="header-actions">
      <button class="add-button" @click="openCreateModal">
        Adicionar Nova Transação
      </button>
      <button class="import-button" @click="showImportModal = true">
        Importar
      </button>
      <div class="view-toggle">
        <button :class="['toggle-btn', { active: viewMode === 'cards' }]" @click="viewMode = 'cards'">Cards</button>
        <button :class="['toggle-btn', { active: viewMode === 'table' }]" @click="viewMode = 'table'">Tabela</button>
      </div>
    </div>

    <div v-if="viewMode === 'cards'" class="transactions-grid">
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

    <DataTable
      v-if="viewMode === 'table'"
      :columns="tableColumns"
      :data="pagedData?.items ?? []"
      v-model:currentPage="tableState.currentPage"
      v-model:pageSize="tableState.pageSize"
      v-model:sortBy="tableState.sortBy"
      v-model:sortDir="tableState.sortDir"
      v-model:search="tableState.search"
      :totalCount="pagedData?.totalCount ?? 0"
      :loading="pagedLoading"
    >
      <template #cell-type="{ value }">
        <span class="type-badge" :class="value === 0 ? 'income' : 'expense'">
          {{ formatTransactionType(value as number) }}
        </span>
      </template>
      <template #cell-isActive="{ value }">
        <span class="status-badge" :class="value ? 'active' : 'inactive'">
          {{ value ? 'Ativa' : 'Inativa' }}
        </span>
      </template>
      <template #actions="{ row }">
        <button class="edit-button" style="padding: 6px 12px;" @click="editTransaction(row)">Editar</button>
        <button class="delete-button" style="padding: 6px 12px; margin-left: 6px;" @click="askDelete(row.id)">Excluir</button>
      </template>
    </DataTable>

    <TransactionModal :show="showModal" :transaction="selectedTransaction" :accounts="accounts || []"
      :categories="categories || []" :goals="goals || []" :debts="debts || []" @close="showModal = false"
      @save="handleSave" />
    <ConfirmModal :show="showDeleteModal" title="Excluir transação" message="Esta ação não pode ser desfeita."
      @cancel="showDeleteModal = false" @confirm="confirmDelete" />
    <ImportTransactionsModal
      :show="showImportModal"
      :accounts="accounts || []"
      :categories="categories || []"
      @close="showImportModal = false"
      @imported="handleGet"
    />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { onMounted, reactive, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { accountService } from '@/modules/accounts/services/account.service';
import { categoryService } from '@/modules/categories/services/category.service';
import { transactionService } from '../services/transaction.service';

import ConfirmModal from '@/shared/components/ConfirmModal.vue';
import DataTable from '@/shared/components/DataTable.vue';
import type { ColumnDef } from '@/shared/components/DataTable.vue';
import ImportTransactionsModal from '../components/ImportTransactionsModal.vue';
import TransactionModal from '../components/TransactionModal.vue';
import type { PagedResponse } from '@/shared/types/paged.types';

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
import { formatCurrency, formatDate, formatTransactionType } from '@/shared/utils/formatters';

const transactions = ref<TransactionResponse[]>([]);
const showModal = ref(false);
const viewMode = ref<'cards' | 'table'>('cards');
const tableState = reactive({
  currentPage: 1,
  pageSize: 10,
  sortBy: 'date',
  sortDir: 'desc' as 'asc' | 'desc',
  search: '',
});
const pagedData = ref<PagedResponse<TransactionResponse> | null>(null);
const showImportModal = ref(false);
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
  execute: executeGetPaged,
  data: pagedTransactionsData,
  loading: pagedLoading,
} = useApi<PagedResponse<TransactionResponse>>(() =>
  transactionService.getPaged({
    page: tableState.currentPage,
    pageSize: tableState.pageSize,
    search: tableState.search,
    sortBy: tableState.sortBy,
    sortDir: tableState.sortDir,
  }),
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

const fetchPaged = async () => {
  await executeGetPaged();
  if (pagedTransactionsData.value) pagedData.value = pagedTransactionsData.value;
};

watch(viewMode, (mode) => {
  if (mode === 'table') fetchPaged();
});

watch(tableState, fetchPaged, { deep: true });

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

const formatType = formatTransactionType;

const tableColumns: ColumnDef[] = [
  { key: 'description', label: 'Descrição', sortable: true },
  { key: 'type', label: 'Tipo', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, align: 'right', format: (v) => formatCurrency(v as number) },
  { key: 'date', label: 'Data', sortable: true, format: (v) => formatDate(v as string) },
  { key: 'accountName', label: 'Conta', sortable: true },
  { key: 'categoryName', label: 'Categoria', sortable: true },
  { key: 'isActive', label: 'Status', sortable: true },
];

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

.header-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 6px;
}

.import-button {
  background-color: #0f172a;
  color: #cbd5e1;
  border: 1px solid #334155;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.import-button:hover {
  background-color: #1e293b;
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

.view-toggle {
  display: flex;
  gap: 4px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 4px;
  margin-left: auto;
}

.toggle-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #2563eb;
  color: white;
}
</style>
