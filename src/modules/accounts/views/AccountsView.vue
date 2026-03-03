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
          <h3>{{ account.name }}</h3>

          <div class="account-meta">
            <p>{{ formatAccountType(account.type) }}</p>

            <span class="status-badge" :class="account.isActive ? 'active' : 'inactive'">
              {{ account.isActive ? 'Ativa' : 'Inativa' }}
            </span>
          </div>

          <h3 class="balance">
            {{ formatCurrency(account.initialBalance) }}
          </h3>

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
      await handleGetAccounts();
      showModal.value = false;
    }
  }

  selectedAccount.value = null;
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
  gap: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.account-card:hover {
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
