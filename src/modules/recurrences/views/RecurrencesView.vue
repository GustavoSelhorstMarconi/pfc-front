<template>
  <div class="recurrences-view">
    <h1>Recorrências</h1>

    <button class="add-button" @click="openCreateModal">
      Adicionar Nova Recorrência
    </button>

    <div class="recurrences-grid">
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

              <span class="type-badge" :class="recurrence.type === 0 ? 'income' : 'expense'">
                {{ formatType(recurrence.type) }}
              </span>
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
import { onMounted, ref } from 'vue';
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
  execute: getAccounts,
  data: accounts,
  error: errorGetAccounts,
} = useApi<AccountResponse[]>(() => accountService.get());

const {
  execute: getCategories,
  data: categories,
  error: errorGetCategories,
} = useApi<CategoryResponse[]>(() => categoryService.get());

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
      toast.error('Erro ao atualizar recorrência');
    } else if (updatedRecurrence.value) {
      toast.success('Recorrência atualizada!');
      await handleGet();
    }
  } else {
    await createRecurrence(form);

    if (errorCreate.value) {
      toast.error('Erro ao criar recorrência');
    } else if (createdRecurrence.value) {
      toast.success('Recorrência criada!');
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatDate = (date: string) =>
  date.split('T')[0]?.split('-').reverse().join('/');

const formatType = (type: number) =>
  type === 0 ? 'Receita' : 'Despesa';

const formatFrequency = (frequency: number) => {
  switch (frequency) {
    case 0:
      return 'Diária';
    case 1:
      return 'Semanal';
    case 2:
      return 'Mensal';
    case 3:
      return 'Anual';
    default:
      return '';
  }
};

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
  await handleGet();
  await handleGetAccounts();
  await handleGetCategories();
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
</style>
