<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>
        {{ transaction ? 'Editar Transação' : 'Nova Transação' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="form-grid">

        <div class="form-group full-width">
          <label>Descrição:</label>
          <input v-model="form.description" type="text" />
        </div>

        <div class="form-group">
          <label>Conta:</label>
          <select v-model="form.accountId" required>
            <option disabled value="">Selecione</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }} - {{ formatAccountType(account.type) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Categoria:</label>
          <select v-model="form.categoryId" required>
            <option disabled value="">Selecione</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }} - {{ formatCategoryType(category.type) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Tipo:</label>
          <select v-model="form.type">
            <option :value="0">Receita</option>
            <option :value="1">Despesa</option>
          </select>
        </div>

        <div class="form-group">
          <label>Valor:</label>
          <input :value="formattedAmount" @input="handleCurrencyInput" type="text" required />
        </div>

        <div class="form-group">
          <label>Data:</label>
          <input v-model="form.date" type="date" required />
        </div>

        <div class="form-group">
          <label>Meta (opcional):</label>
          <select v-model="form.goalId">
            <option :value="null">Selecione</option>
            <option v-for="goal in goals" :key="goal.id" :value="goal.id">
              {{ goal.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Dívida (opcional):</label>
          <select v-model="form.debtId">
            <option :value="null">Selecione</option>
            <option v-for="debt in debts" :key="debt.id" :value="debt.id">
              {{ debt.name }}
            </option>
          </select>
        </div>

        <div class="modal-actions full-width">
          <button type="button" @click="closeModal">Cancelar</button>
          <button type="submit">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AccountResponse } from '@/modules/accounts/types/account.types';
import { AccountType } from '@/modules/accounts/types/account.types';
import type { CategoryResponse } from '@/modules/categories/types/category.types';
import { CategoryType } from '@/modules/categories/types/category.types';
import { computed, ref, watch } from 'vue';

import type { DebtResponse } from '@/modules/debts/types/debt.types';
import type { GoalResponse } from '@/modules/goals/types/goal.types';
import type {
  CreateTransactionRequest,
  TransactionResponse,
  UpdateTransactionRequest,
} from '../types/transaction.types';

interface Props {
  transaction?: TransactionResponse | null;
  show: boolean;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  goals: GoalResponse[];
  debts: DebtResponse[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [form: CreateTransactionRequest | UpdateTransactionRequest];
}>();

const form = ref<CreateTransactionRequest | UpdateTransactionRequest>({
  accountId: '',
  categoryId: '',
  type: 0,
  amount: 0,
  date: '',
  description: '',
  goalId: null,
  debtId: null,
});

const closeModal = () => emit('close');

const handleSubmit = () => {
  if (props.transaction) {
    emit('save', {
      id: props.transaction.id,
      ...form.value,
    });
  } else {
    emit('save', form.value);
  }
};

const formattedAmount = computed(() => {
  if (!form.value.amount) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(form.value.amount);
});

const handleCurrencyInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const numericValue = input.value.replace(/\D/g, '');
  form.value.amount = Number(numericValue) / 100;
};

const formatAccountType = (type: AccountType) => {
  switch (type) {
    case 0:
      return 'Corrente';
    case 1:
      return 'Poupança';
    case 2:
      return 'Carteira';
    default:
      return '';
  }
};

const formatCategoryType = (type: CategoryType) => {
  switch (type) {
    case 0:
      return 'Receita';
    case 1:
      return 'Despesa';
    default:
      return '';
  }
};

watch(
  () => props.transaction,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...newValue,
        date: newValue.date.substring(0, 10),
      };
    } else {
      form.value = {
        accountId: '',
        categoryId: '',
        type: 0,
        amount: 0,
        date: '',
        description: '',
        goalId: null,
        debtId: null,
      };
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #111827;
  padding: 40px;
  border-radius: 12px;
  width: 800px;
  max-width: 95%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 2;
}

h2 {
  color: #3b82f6;
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  font-size: 14px;
  margin-bottom: 6px;
  color: #cbd5e1;
}

input,
select {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #334155;
  background-color: #1f2937;
  color: white;
  outline: none;
  transition: border 0.2s;
}

input:focus,
select:focus {
  border-color: #3b82f6;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 40px;
  padding: 0;
  border: 1px solid #334155;
  border-radius: 6px;
  background-color: #1f2937;
  cursor: pointer;
}

.color-hex {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #334155;
  background-color: #1f2937;
  color: white;
  outline: none;
  transition: border 0.2s;
}

.color-hex:focus {
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.status-group {
  margin-top: 10px;
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-container span {
  font-weight: 600;
  font-size: 14px;
}

.toggle-container span.active {
  color: #22c55e;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #374151;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch input:checked+.slider {
  background-color: #22c55e;
}

.switch input:checked+.slider:before {
  transform: translateX(20px);
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

button[type='submit'] {
  background-color: #2563eb;
  color: white;
}

button[type='submit']:hover {
  background-color: #1d4ed8;
}

button[type='button'] {
  background-color: #ef4444;
  color: white;
}

button[type='button']:hover {
  background-color: #dc2626;
}
</style>
