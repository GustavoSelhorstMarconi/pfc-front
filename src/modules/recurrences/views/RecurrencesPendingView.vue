<template>
  <div class="recurrences-view">
    <h1>Gerar Recorrências Pendentes</h1>

    <div class="filter-card">
      <div class="form-group">
        <label>Gerar até</label>
        <input type="date" v-model="untilDate" />
      </div>

      <button class="add-button" @click="handleGetPending">
        Buscar Pendências
      </button>
    </div>

    <div v-if="loading" class="recurrences-grid">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>

    <div v-else-if="dataRecurrencesPending?.length === 0" class="empty-state">
      Nenhuma recorrência pendente até esta data.
    </div>

    <div v-else class="recurrences-grid">
      <div v-for="item in dataRecurrencesPending" :key="item.recurrenceId + item.occurrenceDate"
        class="recurrence-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">
              {{ item.description || 'Sem descrição' }}
            </h3>

            <div class="card-subtitle">
              <span class="status-badge active">
                Pendente
              </span>

              <span class="status-badge inactive">
                {{ formatDate(item.occurrenceDate) }}
              </span>
            </div>
          </div>

          <input type="checkbox" :checked="isSelected(item)" @change="toggleSelection(item)" class="card-checkbox" />
        </div>

        <div class="amount" :class="item.amount >= 0 ? 'income' : 'expense'">
          {{ formatCurrency(item.amount) }}
        </div>

        <div class="card-actions">
          <button class="edit-button" @click="toggleSelection(item)">
            {{ isSelected(item) ? 'Remover' : 'Selecionar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedItems.length > 0" class="generate-floating">
      <button class="generate-button" @click="generateSelected">
        Gerar {{ selectedItems.length === 1 ? '1 Transação' : `${selectedItems.length} transações` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import { transactionService } from '@/modules/transactions/services/transaction.service';
import type { GenerateTransactionFromRecurrenceRequest, TransactionResponse } from '@/modules/transactions/types/transaction.types';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { ref } from "vue";
import { toast } from 'vue-sonner';
import { recurrenceService } from '../services/recurrence.service';
import type { PendingRecurrenceOcurrenceDto } from "../types/recurrence.types";

const untilDate = ref<string>(new Date().toISOString().split("T")[0]!);
const selectedItems = ref<GenerateTransactionFromRecurrenceRequest[]>([]);

const {
  execute: getRecurrencesPending,
  data: dataRecurrencesPending,
  loading,
  error: errorGet,
} = useApi<PendingRecurrenceOcurrenceDto[], string>((untilDateValue) => recurrenceService.getPending(untilDateValue));

const {
  execute: createTransactionFromRecurrences,
  data: createdTransactionFromRecurrences,
  error: errorCreateTransactionFromRecurrences,
} = useApi<TransactionResponse[], GenerateTransactionFromRecurrenceRequest[]>((r) =>
  transactionService.generateFromRecurrences(r),
);

const handleGetPending = async () => {
  await getRecurrencesPending(untilDate.value);

  if (errorGet.value) {
    toast.error('Erro ao carregar recorrências');
  }
};

const generateSelected = async () => {
  await createTransactionFromRecurrences(selectedItems.value);

  if (errorCreateTransactionFromRecurrences.value) {
    toast.error('Erro ao gerar transações: ' + (errorCreateTransactionFromRecurrences.value?.detail ?? 'Erro desconhecido'));
  } else if (createdTransactionFromRecurrences.value) {
    toast.success('Transações geradas com sucesso!');
    await handleGetPending();
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (date: string) => {
  return date.split('-').reverse().join('/');
};

const isSelected = (item: PendingRecurrenceOcurrenceDto) => {
  return selectedItems.value.some(
    (x) =>
      x.recurrenceId === item.recurrenceId &&
      x.occurrenceDate === item.occurrenceDate
  );
};

const toggleSelection = (item: PendingRecurrenceOcurrenceDto) => {
  const index = selectedItems.value.findIndex(
    (x) =>
      x.recurrenceId === item.recurrenceId &&
      x.occurrenceDate === item.occurrenceDate
  );

  if (index >= 0) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item);
  }
};
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

.filter-card {
  width: 320px;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

input {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #334155;
  background-color: #1f2937;
  color: white;
  outline: none;
}

input:focus {
  border-color: #3b82f6;
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
  background-color: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.card-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.add-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.add-button:hover {
  background-color: #1d4ed8;
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

.generate-floating {
  position: fixed;
  top: 24px;
  right: 24px;
}

.generate-button {
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.4);
  transition: transform 0.2s ease;
}

.generate-button:hover {
  transform: scale(1.05);
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}
</style>