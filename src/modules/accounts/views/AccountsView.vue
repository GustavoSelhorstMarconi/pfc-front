<template>
  <div class="accounts-view">
    <h1>Contas</h1>
    <button class="add-button" @click="openCreateModal">Adicionar Nova Conta</button>
    <div class="accounts-grid">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div v-for="account in accounts" :key="account.id" class="account-card">
          <div class="card-top">
            <h3 class="account-name">{{ account.name }}</h3>
            <span class="status-badge" :class="account.isActive ? 'active' : 'inactive'">
              {{ account.isActive ? 'Ativa' : 'Inativa' }}
            </span>
          </div>

          <p class="account-type">{{ formatAccountType(account.type) }}</p>

          <div class="balance-section">
            <div class="balance-row">
              <span class="balance-label">Saldo Inicial</span>
              <span class="balance-value initial">{{ formatCurrency(account.initialBalance) }}</span>
            </div>
            <div class="balance-divider" />
            <div class="balance-row">
              <span class="balance-label">Saldo Atual</span>
              <span
                class="balance-value current"
                :class="account.currentBalance >= 0 ? 'positive' : 'negative'"
              >{{ formatCurrency(account.currentBalance) }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="edit-button" @click="editAccount(account)">Editar</button>
          </div>
        </div>
      </template>
    </div>
    <AccountModal :show="showModal" :account="selectedAccount" @close="showModal = false" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import { formatAccountType, formatCurrency } from '@/shared/utils/formatters';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import AccountModal from '../components/AccountModal.vue';
import { accountService } from '../services/account.service';
import type {
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../types/account.types';

const accounts = ref<AccountResponse[]>([]);
const showModal = ref(false);
const selectedAccount = ref<AccountResponse | null>(null);

const {
  execute: getAccounts,
  data,
  loading,
  error: errorGetAccounts,
} = useApi<AccountResponse[]>(() => accountService.get());
const {
  execute: createAccount,
  data: createdAccount,
  error: errorCreateAccount,
} = useApi<AccountResponse, CreateAccountRequest>((account: CreateAccountRequest) =>
  accountService.create(account),
);
const {
  execute: updateAccount,
  data: updatedAccount,
  error: errorUpdateAccount,
} = useApi<AccountResponse, UpdateAccountRequest>((account: UpdateAccountRequest) =>
  accountService.update(account.id, account),
);

const handleSave = async (form: CreateAccountRequest | UpdateAccountRequest) => {
  if ('id' in form) {
    await updateAccount(form);

    if (errorUpdateAccount.value) {
      toast.error(
        'Erro ao atualizar conta: ' + (errorUpdateAccount.value?.detail ?? 'Erro desconhecido'),
      );
    } else if (updatedAccount.value) {
      toast.success('Conta atualizada com sucesso!');
      showModal.value = false;
      selectedAccount.value = null;
      await handleGetAccounts();
    }
  } else {
    await createAccount(form);

    if (errorCreateAccount.value) {
      toast.error(
        'Erro ao criar conta: ' + (errorCreateAccount.value?.detail ?? 'Erro desconhecido'),
      );
    } else if (createdAccount.value) {
      toast.success('Conta criada com sucesso!');
      showModal.value = false;
      selectedAccount.value = null;
      await handleGetAccounts();
    }
  }
};


onMounted(async () => {
  await handleGetAccounts();
});

const handleGetAccounts = async () => {
  await getAccounts();

  if (errorGetAccounts.value) {
    toast.error(
      'Erro ao carregar contas: ' + (errorGetAccounts.value?.detail ?? 'Erro desconhecido'),
    );
  }

  if (data.value) {
    accounts.value = data.value;
  }
};

const openCreateModal = () => {
  selectedAccount.value = null;
  showModal.value = true;
};

const editAccount = (account: AccountResponse) => {
  selectedAccount.value = account;
  showModal.value = true;
};
</script>

<style scoped>
.accounts-view {
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
  transition: background 0.2s;
}

.add-button:hover {
  background-color: #1d4ed8;
}

.accounts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  overflow: hidden;
}

.account-card {
  width: 280px;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.account-name {
  font-size: 16px;
  font-weight: 700;
  color: #cbd5e1;
  margin: 0;
}

.account-type {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.status-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.active {
  background-color: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge.inactive {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.balance-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
  padding: 14px;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.balance-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.balance-value {
  font-size: 15px;
  font-weight: 700;
}

.balance-value.initial {
  color: #94a3b8;
}

.balance-value.current.positive {
  color: #22c55e;
}

.balance-value.current.negative {
  color: #ef4444;
}

.balance-divider {
  height: 1px;
  background-color: #1e293b;
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
