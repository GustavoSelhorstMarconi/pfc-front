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
  border-radius: 8px;
  padding: 20px;
  background-color: #381818;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.debt-values {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.total-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.value-line {
  margin: 0;
  font-size: 14px;
}

.remaining {
  color: #f87171;
}

.interest-badge {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.due-date {
  font-size: 13px;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.status-badge.inactive {
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
}

.card-actions {
  margin-top: auto;
}

.edit-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid white;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}
</style>
