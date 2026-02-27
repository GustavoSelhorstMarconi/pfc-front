<template>
  <div class="debts-view">
    <h1>Dívidas</h1>

    <button class="add-button" @click="openCreateModal">Adicionar Nova Dívida</button>

    <div class="debts-grid">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div v-for="debt in debts" :key="debt.id" class="debt-card">
          <h3>{{ debt.name }}</h3>

          <div class="debt-values">
            <div class="total-group">
              <p class="value-line">
                <strong>Total:</strong>
                {{ formatCurrency(debt.totalAmount) }}
              </p>

              <span v-if="debt.interestRate !== undefined" class="interest-badge">
                {{ formatInterest(debt.interestRate) }}
              </span>
            </div>

            <p class="value-line remaining">
              <strong>Restante:</strong>
              {{ formatCurrency(debt.remainingAmount) }}
            </p>
          </div>

          <div v-if="debt.dueDate" class="due-date">
            Vencimento: {{ formatDate(debt.dueDate) }}
          </div>

          <span class="status-badge" :class="debt.isActive ? 'active' : 'inactive'">
            {{ debt.isActive ? 'Ativa' : 'Inativa' }}
          </span>

          <div class="card-actions">
            <button class="edit-button" @click="editDebt(debt)">
              Editar
            </button>
          </div>
        </div>
      </template>
    </div>

    <DebtModal :show="showModal" :debt="selectedDebt" @close="showModal = false" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import DebtModal from '../components/DebtModal.vue';
import { debtService } from '../services/debt.service';
import type { CreateDebtRequest, DebtResponse, UpdateDebtRequest } from '../types/debt.types';

const debts = ref<DebtResponse[]>([]);
const showModal = ref(false);
const selectedDebt = ref<DebtResponse | null>(null);

const {
  execute: getDebts,
  data,
  loading,
  error: errorGetDebts,
} = useApi<DebtResponse[]>(() => debtService.get());

const {
  execute: createDebt,
  data: createdDebt,
  error: errorCreateDebt,
} = useApi<DebtResponse, CreateDebtRequest>((debt) => debtService.create(debt));

const {
  execute: updateDebt,
  data: updatedDebt,
  error: errorUpdateDebt,
} = useApi<DebtResponse, UpdateDebtRequest>((debt) => debtService.update(debt.id, debt));

const handleGetDebts = async () => {
  await getDebts();

  if (data.value) {
    debts.value = data.value;
  }

  if (errorGetDebts.value) {
    toast.error('Erro ao carregar dívidas: ' + (errorGetDebts.value?.detail ?? 'Erro desconhecido'));
  }
};

const handleSave = async (form: CreateDebtRequest | UpdateDebtRequest) => {
  if ('id' in form) {
    await updateDebt(form);

    if (errorUpdateDebt.value) {
      toast.error(
        'Erro ao atualizar dívida: ' + (errorUpdateDebt.value?.detail ?? 'Erro desconhecido'),
      );
    } else if (updatedDebt.value) {
      toast.success('Dívida atualizada com sucesso!');
      await handleGetDebts();
    }
  } else {
    await createDebt(form);

    if (errorCreateDebt.value) {
      toast.error('Erro ao criar dívida: ' + (errorCreateDebt.value?.detail ?? 'Erro desconhecido'));
    } else if (createdDebt.value) {
      toast.success('Dívida criada com sucesso!');
      await handleGetDebts();
    }
  }

  selectedDebt.value = null;
};

const openCreateModal = () => {
  selectedDebt.value = null;
  showModal.value = true;
};

const editDebt = (debt: DebtResponse) => {
  selectedDebt.value = debt;
  showModal.value = true;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatInterest = (value?: number) => {
  if (value === undefined || value === null) return '';

  return `${value.toFixed(2)}% a.m.`;
};

const formatDate = (date: string) => {
  return date.split('-').reverse().join('/');
};

onMounted(async () => {
  await handleGetDebts();
});
</script>

<style scoped>
.debts-view {
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

.debts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.debt-card {
  width: 280px;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(145deg, #1e273b, #0f1e3f);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.debt-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.status-badge {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  width: fit-content;
}

.status-badge.active {
  background-color: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.inactive {
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
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
