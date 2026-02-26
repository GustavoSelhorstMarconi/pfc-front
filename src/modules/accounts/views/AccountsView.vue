<template>
  <div class="accounts-view">
    <h1>Contas</h1>
    <button class="add-button" @click="showModal = true">Adicionar Nova Conta</button>
    <div class="accounts-grid">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-button"></div>
        </div>
      </template>

      <template v-else>
        <div v-for="account in accounts" :key="account.id" class="account-card">
          <h3>{{ account.name }}</h3>

          <div class="account-meta">
            <p>{{ getAccountTypeText(account.type) }}</p>

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
    <AccountModal
      :show="showModal"
      :account="selectedAccount"
      @close="showModal = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import AccountModal from '../components/AccountModal.vue'
import { accountService } from '../services/account.service'
import type {
  AccountResponse,
  AccountType,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../types/account.types'

const accounts = ref<AccountResponse[]>([])
const showModal = ref(false)
const selectedAccount = ref<AccountResponse | null>(null)

const {
  execute: getAccounts,
  data,
  loading,
  error: errorGetAccounts,
} = useApi<AccountResponse[]>(() => accountService.get())
const {
  execute: createAccount,
  data: createdAccount,
  error: errorCreateAccount,
} = useApi<AccountResponse, CreateAccountRequest>((account: CreateAccountRequest) =>
  accountService.create(account),
)
const {
  execute: updateAccount,
  data: updatedAccount,
  error: errorUpdateAccount,
} = useApi<AccountResponse, UpdateAccountRequest>((account: UpdateAccountRequest) =>
  accountService.update(account.id, account),
)

const handleSave = async (form: CreateAccountRequest | UpdateAccountRequest) => {
  if ('id' in form) {
    await updateAccount(form)

    if (errorUpdateAccount.value) {
      toast.error(
        'Erro ao atualizar conta: ' + (errorUpdateAccount.value?.detail ?? 'Erro desconhecido'),
      )
    } else if (updatedAccount.value) {
      toast.success('Conta atualizada com sucesso!')
      await handleGetAccounts()
    }
  } else {
    await createAccount(form)

    if (errorCreateAccount.value) {
      toast.error(
        'Erro ao criar conta: ' + (errorCreateAccount.value?.detail ?? 'Erro desconhecido'),
      )
    } else if (createdAccount.value) {
      toast.success('Conta criada com sucesso!')
      await handleGetAccounts()
      showModal.value = false
    }
  }

  selectedAccount.value = null
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const getAccountTypeText = (type: AccountType) => {
  switch (type) {
    case 0:
      return 'Corrente'
    case 1:
      return 'Carteira'
    case 2:
      return 'Cartão de crédito'
    case 3:
      return 'Investimentos'
    default:
      return 'Desconecido'
  }
}

onMounted(async () => {
  await handleGetAccounts()
})

const handleGetAccounts = async () => {
  await getAccounts()

  if (errorGetAccounts.value) {
    toast.error(
      'Erro ao carregar contas: ' + (errorGetAccounts.value?.detail ?? 'Erro desconhecido'),
    )
  }

  if (data.value) {
    accounts.value = data.value
  }
}

const editAccount = (account: AccountResponse) => {
  selectedAccount.value = account
  showModal.value = true
}
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
  border-radius: 8px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #1f2937;
}

.account-card h3 {
  margin: 0 0 10px 0;
}

.account-card p {
  margin: 0 0 20px 0;
}

.account-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.account-meta p {
  margin: 0;
  font-weight: bold;
}

.status-badge {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
}

.status-badge.active {
  background-color: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.inactive {
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
}

.edit-button,
.delete-button {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid white;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.edit-button {
  padding: 0 16px;
}

.delete-button {
  width: 36px;
  padding: 0;
}

.edit-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.delete-button:hover {
  background-color: #ef4444;
  border-color: #ef4444;
}

.skeleton-card {
  width: 280px;
  padding: 20px;
  border-radius: 8px;
  background: #1f2937;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.skeleton-title .skeleton-text,
.skeleton-button {
  background: linear-gradient(90deg, #374151 25%, #4b5563 37%, #374151 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 6px;
}

.skeleton-title {
  height: 20px;
  width: 100%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 16px;
  width: 40%;
  margin-bottom: 20px;
}

.skeleton-button {
  height: 36px;
  width: 100px;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
