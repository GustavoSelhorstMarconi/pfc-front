<template>
  <div class="recurrences-view">
    <h1>Recorrências</h1>

    <div class="header-actions">
      <button class="add-button" @click="openCreateModal">
        Adicionar Nova Recorrência
      </button>
      <div class="view-toggle">
        <button :class="['toggle-btn', { active: viewMode === 'cards' }]" @click="viewMode = 'cards'">Cards</button>
        <button :class="['toggle-btn', { active: viewMode === 'table' }]" @click="viewMode = 'table'">Tabela</button>
      </div>
    </div>

    <div v-if="viewMode === 'cards'" class="recurrences-grid">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div v-for="recurrence in recurrences" :key="recurrence.id" class="recurrence-card">
          <div class="card-header">
            <div>
              <h3 class="card-title">
                {{ recurrence.description || 'Sem descrição' }}
              </h3>

              <div class="card-subtitle">
                <span class="type-badge" :class="recurrence.type === 0 ? 'income' : 'expense'">
                  {{ formatType(recurrence.type) }}
                </span>

                <span class="status-badge" :class="recurrence.generatesTransaction ? 'active' : 'inactive'">
                  {{ recurrence.generatesTransaction ? 'Gera Transação' : 'Não Gera Transação' }}
                </span>
              </div>
            </div>

            <span class="status-badge" :class="recurrence.isActive ? 'active' : 'inactive'">
              {{ recurrence.isActive ? 'Ativa' : 'Inativa' }}
            </span>
          </div>

          <div class="amount" :class="recurrence.type === 0 ? 'income' : 'expense'">
            {{ formatCurrency(recurrence.amount) }}
          </div>

          <div class="recurrence-grid">
            <div>
              <span class="label">Frequência</span>
              <span class="value">
                {{ formatFrequency(recurrence.frequency) }}
              </span>
            </div>

            <div>
              <span class="label">Intervalo</span>
              <span class="value">
                A cada {{ recurrence.interval }}
              </span>
            </div>

            <div>
              <span class="label">Início</span>
              <span class="value">
                {{ formatDate(recurrence.startDate) }}
              </span>
            </div>

            <div v-if="recurrence.endDate">
              <span class="label">Fim</span>
              <span class="value">
                {{ formatDate(recurrence.endDate) }}
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button class="edit-button" @click="editRecurrence(recurrence)">
              Editar
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
      <template #cell-generatesTransaction="{ value }">
        <span class="status-badge" :class="value ? 'active' : 'inactive'">
          {{ value ? 'Sim' : 'Não' }}
        </span>
      </template>
      <template #actions="{ row }">
        <button class="edit-button" style="width: auto; padding: 6px 12px;" @click="editRecurrence(row)">Editar</button>
      </template>
    </DataTable>

    <RecurrenceModal :show="showModal" :recurrence="selectedRecurrence" :accounts="accounts || []"
      :categories="categories || []" @close="showModal = false" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import { accountService } from '@/modules/accounts/services/account.service';
import type { AccountResponse } from '@/modules/accounts/types/account.types';
import { categoryService } from '@/modules/categories/services/category.service';
import type { CategoryResponse } from '@/modules/categories/types/category.types';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import DataTable from '@/shared/components/DataTable.vue';
import type { ColumnDef } from '@/shared/components/DataTable.vue';
import type { PagedResponse } from '@/shared/types/paged.types';
import { formatCurrency, formatDate, formatFrequency, formatTransactionType } from '@/shared/utils/formatters';
import { onMounted, reactive, ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import RecurrenceModal from '../components/RecurrenceModal.vue';
import { recurrenceService } from '../services/recurrence.service';
import type {
  CreateRecurrenceRequest,
  RecurrenceResponse,
  UpdateRecurrenceRequest,
} from '../types/recurrence.types';

const recurrences = ref<RecurrenceResponse[]>([]);
const showModal = ref(false);
const selectedRecurrence = ref<RecurrenceResponse | null>(null);
const viewMode = ref<'cards' | 'table'>('cards');
const tableState = reactive({
  currentPage: 1,
  pageSize: 10,
  sortBy: 'startDate',
  sortDir: 'desc' as 'asc' | 'desc',
  search: '',
});
const pagedData = ref<PagedResponse<RecurrenceResponse> | null>(null);

const {
  execute: getRecurrences,
  data,
  loading,
  error: errorGet,
} = useApi<RecurrenceResponse[]>(() => recurrenceService.get());

const {
  execute: createRecurrence,
  data: createdRecurrence,
  error: errorCreate,
} = useApi<RecurrenceResponse, CreateRecurrenceRequest>((r) =>
  recurrenceService.create(r),
);

const {
  execute: updateRecurrence,
  data: updatedRecurrence,
  error: errorUpdate,
} = useApi<RecurrenceResponse, UpdateRecurrenceRequest>((r) =>
  recurrenceService.update(r.id, r),
);

const {
  execute: executeGetPaged,
  data: pagedRecurrencesData,
  loading: pagedLoading,
} = useApi<PagedResponse<RecurrenceResponse>>(() =>
  recurrenceService.getPaged({
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
  error: errorGetAccounts,
} = useApi<AccountResponse[]>(() => accountService.get());

const {
  execute: getCategories,
  data: categories,
  error: errorGetCategories,
} = useApi<CategoryResponse[]>(() => categoryService.get());

const fetchPaged = async () => {
  await executeGetPaged();
  if (pagedRecurrencesData.value) pagedData.value = pagedRecurrencesData.value;
};

watch(viewMode, (mode) => {
  if (mode === 'table') fetchPaged();
});

watch(tableState, fetchPaged, { deep: true });

const tableColumns: ColumnDef[] = [
  { key: 'description', label: 'Descrição', sortable: true },
  { key: 'type', label: 'Tipo', sortable: true },
  { key: 'frequency', label: 'Frequência', sortable: true, format: (v) => formatFrequency(v as number) },
  { key: 'amount', label: 'Valor', sortable: true, align: 'right', format: (v) => formatCurrency(v as number) },
  { key: 'startDate', label: 'Início', sortable: true, format: (v) => formatDate(v as string) },
  { key: 'endDate', label: 'Fim', sortable: true, format: (v) => v ? formatDate(v as string) : '—' },
  { key: 'isActive', label: 'Status', sortable: true },
  { key: 'generatesTransaction', label: 'Gera Transação', sortable: true },
];

const handleGet = async () => {
  await getRecurrences();

  if (data.value) recurrences.value = data.value;

  if (errorGet.value) {
    toast.error('Erro ao carregar recorrências');
  }
};

const handleSave = async (
  form: CreateRecurrenceRequest | UpdateRecurrenceRequest,
) => {
  if ('id' in form) {
    await updateRecurrence(form);

    if (errorUpdate.value) {
      toast.error('Erro ao atualizar recorrência: ' + (errorUpdate.value?.detail ?? 'Erro desconhecido'));
    } else if (updatedRecurrence.value) {
      toast.success('Recorrência atualizada!');
      showModal.value = false;
      await handleGet();
    }
  } else {
    await createRecurrence(form);

    if (errorCreate.value) {
      toast.error('Erro ao criar recorrência: ' + (errorCreate.value?.detail ?? 'Erro desconhecido'));
    } else if (createdRecurrence.value) {
      toast.success('Recorrência criada!');
      showModal.value = false;
      await handleGet();
    }
  }

  selectedRecurrence.value = null;
};

const openCreateModal = () => {
  selectedRecurrence.value = null;
  showModal.value = true;
};

const editRecurrence = (recurrence: RecurrenceResponse) => {
  selectedRecurrence.value = recurrence;
  showModal.value = true;
};

const formatType = formatTransactionType;

const handleGetAccounts = async () => {
  await getAccounts();

  if (errorGetAccounts.value) {
    toast.error('Erro ao carregar contas');
  }
};

const handleGetCategories = async () => {
  await getCategories();

  if (errorGetCategories.value) {
    toast.error('Erro ao carregar categorias');
  }
};

onMounted(async () => {
  await Promise.all([
    handleGet(),
    handleGetAccounts(),
    handleGetCategories(),
  ]);
});

</script>

<style scoped>
.recurrences-view {
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

.recurrences-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.recurrence-card {
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

.recurrence-card:hover {
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

.card-subtitle {
  display: flex;
  gap: 8px;
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

.recurrence-grid {
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
}

.edit-button {
  width: 100%;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.add-button {
  margin-bottom: 0;
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
