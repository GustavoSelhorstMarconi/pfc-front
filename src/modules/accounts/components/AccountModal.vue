<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>{{ account ? 'Editar Conta' : 'Nova Conta' }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Nome:</label>
          <input id="name" v-model="form.name" type="text" required />
        </div>

        <div class="form-group">
          <label for="type">Tipo:</label>
          <select id="type" v-model="form.type" required>
            <option :value="0">Conta Corrente</option>
            <option :value="1">Carteira</option>
            <option :value="2">Cartão de Crédito</option>
            <option :value="3">Investimento</option>
          </select>
        </div>

        <div v-if="!account" class="form-group">
          <label for="initialBalance">Saldo Inicial:</label>
          <input id="initialBalance" type="text" inputmode="numeric" :value="formattedInitialBalante"
            @input="handleCurrencyInput" required />
        </div>

        <div v-if="account" class="form-group status-group">
          <label>Status:</label>

          <div class="toggle-container">
            <span :class="{ active: form.isActive }">
              {{ form.isActive ? 'Ativa' : 'Inativa' }}
            </span>

            <label class="switch">
              <input type="checkbox" v-model="form.isActive" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeModal">Cancelar</button>
          <button type="submit">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, parseCurrencyInput } from '@/shared/utils/formatters';
import { computed, ref, watch } from 'vue';
import type {
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../types/account.types';

interface Props {
  account?: AccountResponse | null;
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [form: CreateAccountRequest | UpdateAccountRequest];
}>();

const form = ref({
  name: '',
  type: 0,
  initialBalance: 0,
  isActive: true,
});

const closeModal = () => {
  emit('close');
};

const formattedInitialBalante = computed(() =>
  form.value.initialBalance ? formatCurrency(form.value.initialBalance) : ''
);

const handleCurrencyInput = (event: Event) => {
  form.value.initialBalance = parseCurrencyInput(event);
};

const handleSubmit = () => {
  if (props.account) {
    const updateRequest: UpdateAccountRequest = {
      id: props.account.id,
      name: form.value.name,
      type: form.value.type,
      isActive: form.value.isActive,
    };

    emit('save', updateRequest);
  } else {
    const createRequest: CreateAccountRequest = {
      name: form.value.name,
      type: form.value.type,
      initialBalance: form.value.initialBalance,
    };

    emit('save', createRequest);
  }

  closeModal();
};

watch(
  () => props.account,
  (newAccount) => {
    if (newAccount) {
      form.value = {
        name: newAccount.name,
        type: newAccount.type,
        initialBalance: newAccount.initialBalance,
        isActive: newAccount.isActive,
      };
    } else {
      form.value = {
        name: '',
        type: 0,
        initialBalance: 0,
        isActive: true,
      };
    }
  },
  { immediate: true },
);

watch(
  () => props.show,
  (newShow) => {
    if (!newShow) {
      form.value = {
        name: '',
        type: 0,
        initialBalance: 0,
        isActive: true,
      };
    }
  },
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
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
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
