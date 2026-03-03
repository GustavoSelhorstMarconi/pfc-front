<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>
        {{ recurrence ? 'Editar Recorrência' : 'Nova Recorrência' }}
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
          <label>Frequência:</label>
          <select v-model="form.frequency">
            <option :value="0">Diária</option>
            <option :value="1">Semanal</option>
            <option :value="2">Mensal</option>
            <option :value="3">Anual</option>
          </select>
        </div>

        <div class="form-group">
          <label>Intervalo:</label>
          <input v-model.number="form.interval" type="number" min="1" required />
        </div>

        <div class="form-group">
          <label>Data de Início:</label>
          <input v-model="form.startDate" type="date" required />
        </div>

        <div class="form-group">
          <label>Data de Fim:</label>
          <input v-model="form.endDate" type="date" />
        </div>

        <div class="toggle-container full-width">
          <span :class="{ active: (form as UpdateRecurrenceRequest).generatesTransaction }">
            Gera transação:
          </span>

          <label class="switch">
            <input type="checkbox" v-model="(form as UpdateRecurrenceRequest).generatesTransaction" required />
            <span class="slider"></span>
          </label>
        </div>

        <div v-if="recurrence" class="form-group status-group full-width">
          <label>Status:</label>

          <div class="toggle-container">
            <span :class="{ active: (form as UpdateRecurrenceRequest).isActive }">
              {{ (form as UpdateRecurrenceRequest).isActive ? 'Ativa' : 'Inativa' }}
            </span>

            <label class="switch">
              <input type="checkbox" v-model="(form as UpdateRecurrenceRequest).isActive" />
              <span class="slider"></span>
            </label>
          </div>
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
import type { CategoryResponse } from '@/modules/categories/types/category.types';
import { formatAccountType, formatCategoryType, formatCurrency, parseCurrencyInput } from '@/shared/utils/formatters';
import { computed, ref, watch } from 'vue';
import type {
  CreateRecurrenceRequest,
  RecurrenceResponse,
  UpdateRecurrenceRequest,
} from '../types/recurrence.types';

interface Props {
  recurrence?: RecurrenceResponse | null;
  show: boolean;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [form: CreateRecurrenceRequest | UpdateRecurrenceRequest];
}>();

const form = ref<CreateRecurrenceRequest | UpdateRecurrenceRequest>({
  accountId: '',
  categoryId: '',
  type: 0,
  amount: 0,
  description: '',
  frequency: 2,
  interval: 1,
  startDate: '',
  endDate: '',
  isActive: true,
  generatesTransaction: false,
});

const closeModal = () => emit('close');

const handleSubmit = () => {
  if (props.recurrence) {
    emit('save', {
      id: props.recurrence.id,
      ...form.value,
    });
  } else {
    emit('save', form.value);
  }

  closeModal();
};

const formattedAmount = computed(() =>
  form.value.amount ? formatCurrency(form.value.amount) : ''
);

const handleCurrencyInput = (event: Event) => {
  form.value.amount = parseCurrencyInput(event);
};

watch(
  () => props.recurrence,
  (newValue) => {
    if (newValue) {
      form.value = {
        ...newValue,
        startDate: newValue.startDate.substring(0, 10),
        endDate: newValue.endDate?.substring(0, 10) || '',
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
