<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>

      <!-- Step indicator -->
      <div class="step-indicator">
        <div class="step" :class="{ active: step >= 1, done: step > 1 }">
          <span class="step-number">1</span>
          <span class="step-label">Upload</span>
        </div>
        <div class="step-line" :class="{ active: step > 1 }" />
        <div class="step" :class="{ active: step >= 2, done: step > 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Revisão</span>
        </div>
        <div class="step-line" :class="{ active: step > 2 }" />
        <div class="step" :class="{ active: step >= 3 }">
          <span class="step-number">3</span>
          <span class="step-label">Concluído</span>
        </div>
      </div>

      <!-- Passo 1: Upload -->
      <template v-if="step === 1">
        <h2>Importar Transações</h2>
        <p class="subtitle">Selecione um arquivo CSV ou OFX exportado do seu banco.</p>

        <input ref="fileInputRef" type="file" accept=".csv,.ofx" class="hidden-input" @change="handleFileChange" />

        <div class="upload-area" :class="{ 'has-file': selectedFile }" @click="fileInputRef?.click()">
          <template v-if="!selectedFile">
            <span class="upload-icon">↑</span>
            <p class="upload-text">Clique para selecionar um arquivo</p>
            <p class="upload-hint">CSV ou OFX — até 5MB</p>
          </template>
          <template v-else>
            <span class="upload-icon file-ok">✓</span>
            <p class="upload-text">{{ selectedFile.name }}</p>
            <p class="upload-hint">{{ formatFileSize(selectedFile.size) }} — clique para trocar</p>
          </template>
        </div>

        <p v-if="uploadError" class="error-msg">{{ uploadError }}</p>

        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="closeModal">Cancelar</button>
          <button type="button" class="submit-button" :disabled="!selectedFile || loading" @click="handlePreview">
            {{ loading ? 'Processando...' : 'Processar arquivo' }}
          </button>
        </div>
      </template>

      <!-- Passo 2: Revisão -->
      <template v-else-if="step === 2">
        <div class="review-header">
          <div>
            <h2>Revisar Transações</h2>
            <p class="subtitle">
              {{ previewItems.length }} transações encontradas
              <span v-if="invalidCount > 0" class="invalid-count"> — {{ invalidCount }} sem categoria</span>
            </p>
          </div>

          <div class="bulk-account">
            <label>Aplicar conta a todos:</label>
            <div class="bulk-account-row">
              <select v-model="bulkAccountId" class="table-select">
                <option value="">Selecione</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }}
                </option>
              </select>
              <button type="button" class="apply-button" :disabled="!bulkAccountId" @click="applyAccountToAll">
                Aplicar
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Valor (R$)</th>
                <th>Conta *</th>
                <th>Categoria *</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in previewItems" :key="item.externalId">
                <td class="col-date">{{ formatDate(item.date) }}</td>
                <td>
                  <input v-model="item.description" type="text" class="table-input" maxlength="300" />
                </td>
                <td class="col-type">
                  <button
                    type="button"
                    class="type-badge"
                    :class="item.type === 0 ? 'income' : 'expense'"
                    @click="toggleType(index)"
                  >
                    {{ item.type === 0 ? 'Receita' : 'Despesa' }}
                  </button>
                </td>
                <td>
                  <input
                    :value="item.amount.toFixed(2)"
                    @change="(e) => updateAmount(index, e)"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="table-input amount-input"
                  />
                </td>
                <td>
                  <select v-model="item.accountId" class="table-select">
                    <option value="">Selecione</option>
                    <option v-for="account in accounts" :key="account.id" :value="account.id">
                      {{ account.name }}
                    </option>
                  </select>
                </td>
                <td>
                  <select
                    v-model="item.categoryId"
                    class="table-select"
                    :class="{ 'select-missing': !item.categoryId }"
                  >
                    <option value="">Selecione</option>
                    <option
                      v-for="category in filteredCategories(item.type)"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="confirmError" class="error-msg">{{ confirmError }}</p>

        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="step = 1">Voltar</button>
          <button
            type="button"
            class="submit-button"
            :disabled="!allItemsValid || loading"
            @click="handleConfirm"
          >
            {{ loading ? 'Importando...' : `Confirmar ${previewItems.length} transações` }}
          </button>
        </div>
      </template>

      <!-- Passo 3: Resultado -->
      <template v-else-if="step === 3">
        <div class="result-screen">
          <div v-if="result && result.failedCount === 0" class="result-icon success">✓</div>
          <div v-else class="result-icon warning">!</div>

          <h2>Importação Concluída</h2>

          <p class="result-success">{{ result?.importedCount }} transações importadas com sucesso.</p>
          <p v-if="result && result.failedCount > 0" class="result-warning">
            {{ result.failedCount }} transações não puderam ser salvas.
            Baixe o arquivo de erros para corrigir e reimportar.
          </p>

          <div class="modal-actions result-actions">
            <button
              v-if="result?.errorFileCsvBase64"
              type="button"
              class="download-button"
              @click="downloadErrorFile"
            >
              Baixar erros (.csv)
            </button>
            <button type="button" class="submit-button" @click="handleClose">Fechar</button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { AccountResponse } from '@/modules/accounts/types/account.types';
import type { CategoryResponse } from '@/modules/categories/types/category.types';
import { computed, ref, watch } from 'vue';
import { transactionService } from '../services/transaction.service';
import type { ConfirmImportResponse, ImportTransactionItem } from '../types/transaction.types';
import { TransactionType } from '../types/transaction.types';

interface EditableImportItem {
  externalId: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  accountId: string;
  categoryId: string;
}

const props = defineProps<{
  show: boolean;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
}>();

const emit = defineEmits<{
  close: [];
  imported: [];
}>();

const step = ref<1 | 2 | 3>(1);
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewItems = ref<EditableImportItem[]>([]);
const result = ref<ConfirmImportResponse | null>(null);
const loading = ref(false);
const uploadError = ref('');
const confirmError = ref('');
const bulkAccountId = ref('');

watch(() => props.show, (visible) => {
  if (!visible) resetState();
});

const allItemsValid = computed(() =>
  previewItems.value.every(item => item.accountId && item.categoryId)
);

const invalidCount = computed(() =>
  previewItems.value.filter(item => !item.categoryId).length
);

const filteredCategories = (type: TransactionType) =>
  props.categories.filter(c => c.type === type);

const formatDate = (date: string) => {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  selectedFile.value = input.files?.[0] ?? null;
  uploadError.value = '';
};

const handlePreview = async () => {
  if (!selectedFile.value) return;

  loading.value = true;
  uploadError.value = '';

  try {
    const response = await transactionService.previewImport(selectedFile.value);
    const defaultAccountId = props.accounts[0]?.id ?? '';

    previewItems.value = response.transactions.map((item: ImportTransactionItem) => ({
      externalId: item.externalId,
      date: item.date,
      amount: item.amount,
      type: item.type,
      description: item.description,
      accountId: defaultAccountId,
      categoryId: item.suggestedCategoryId ?? '',
    }));

    bulkAccountId.value = defaultAccountId;
    step.value = 2;
  } catch (err: unknown) {
    const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
    uploadError.value = detail ?? 'Erro ao processar o arquivo.';
  } finally {
    loading.value = false;
  }
};

const applyAccountToAll = () => {
  if (!bulkAccountId.value) return;
  previewItems.value.forEach(item => { item.accountId = bulkAccountId.value; });
};

const toggleType = (index: number) => {
  const item = previewItems.value[index];
  item.type = item.type === TransactionType.Income ? TransactionType.Expense : TransactionType.Income;
  item.categoryId = '';
};

const updateAmount = (index: number, event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value);
  if (!isNaN(value) && value > 0) {
    previewItems.value[index].amount = value;
  }
};

const handleConfirm = async () => {
  loading.value = true;
  confirmError.value = '';

  try {
    const items = previewItems.value.map(item => ({
      externalId: item.externalId,
      accountId: item.accountId,
      categoryId: item.categoryId,
      type: item.type,
      amount: item.amount,
      date: item.date,
      description: item.description || null,
    }));

    result.value = await transactionService.confirmImport(items);
    step.value = 3;

    if (result.value.importedCount > 0) {
      emit('imported');
    }
  } catch (err: unknown) {
    const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
    confirmError.value = detail ?? 'Erro ao importar transações.';
  } finally {
    loading.value = false;
  }
};

const downloadErrorFile = () => {
  if (!result.value?.errorFileCsvBase64) return;

  const bytes = atob(result.value.errorFileCsvBase64);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  const blob = new Blob([array], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transacoes_com_erro.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const closeModal = () => emit('close');
const handleClose = () => emit('close');

const resetState = () => {
  step.value = 1;
  selectedFile.value = null;
  previewItems.value = [];
  result.value = null;
  loading.value = false;
  uploadError.value = '';
  confirmError.value = '';
  bulkAccountId.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1e293b;
  border-radius: 14px;
  padding: 2rem;
  width: 100%;
  max-width: 1080px;
  max-height: 92vh;
  overflow-y: auto;
  color: #cbd5e1;
}

/* Step indicator */
.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #334155;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.step.active .step-number {
  background: #2563eb;
  color: white;
}

.step.done .step-number {
  background: #22c55e;
  color: white;
}

.step-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.step.active .step-label {
  color: #cbd5e1;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #334155;
  margin: 0 8px;
  margin-bottom: 14px;
  transition: background 0.2s;
}

.step-line.active {
  background: #2563eb;
}

/* Typography */
h2 {
  color: #3b82f6;
  margin-bottom: 0.4rem;
  font-size: 20px;
}

.subtitle {
  color: #94a3b8;
  font-size: 13px;
  margin-bottom: 1.5rem;
}

.invalid-count {
  color: #f59e0b;
  font-weight: 600;
}

/* Upload area */
.hidden-input {
  display: none;
}

.upload-area {
  border: 2px dashed #334155;
  border-radius: 10px;
  padding: 2.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  margin-bottom: 1.5rem;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.04);
}

.upload-area.has-file {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.04);
}

.upload-icon {
  display: block;
  font-size: 32px;
  margin-bottom: 0.5rem;
  color: #64748b;
}

.upload-icon.file-ok {
  color: #22c55e;
}

.upload-text {
  font-size: 15px;
  color: #cbd5e1;
  margin: 0 0 4px;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Review header */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.bulk-account {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 260px;
}

.bulk-account label {
  font-size: 12px;
  color: #94a3b8;
}

.bulk-account-row {
  display: flex;
  gap: 6px;
}

.apply-button {
  padding: 5px 14px;
  background: #334155;
  color: #cbd5e1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;
}

.apply-button:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
}

.apply-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  border: 1px solid #334155;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  text-align: left;
  padding: 10px 10px;
  background: #0f172a;
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid #334155;
  white-space: nowrap;
}

td {
  padding: 7px 10px;
  border-bottom: 1px solid #1a2744;
  vertical-align: middle;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.col-date {
  white-space: nowrap;
  color: #94a3b8;
  font-size: 12px;
}

.col-type {
  white-space: nowrap;
}

/* Type badge (toggle button) */
.type-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.type-badge:hover {
  opacity: 0.8;
}

.type-badge.income {
  background-color: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.type-badge.expense {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Inputs */
.table-input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 5px 8px;
  color: #cbd5e1;
  width: 100%;
  font-size: 13px;
}

.table-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.amount-input {
  width: 90px;
}

.table-select {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 5px 8px;
  color: #cbd5e1;
  width: 100%;
  font-size: 13px;
}

.table-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.table-select.select-missing {
  border-color: #f59e0b;
}

/* Error */
.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin-bottom: 1rem;
}

/* Result screen */
.result-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 0 0.5rem;
}

.result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 1rem;
}

.result-icon.success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.result-icon.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.result-screen h2 {
  margin-bottom: 1rem;
}

.result-success {
  color: #22c55e;
  font-size: 15px;
  margin-bottom: 0.5rem;
}

.result-warning {
  color: #f59e0b;
  font-size: 13px;
  max-width: 380px;
}

.result-actions {
  margin-top: 1.5rem;
  justify-content: center;
}

/* Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 0.5rem;
}

.cancel-button {
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.cancel-button:hover {
  background: #334155;
}

.submit-button {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.submit-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.download-button {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  background: #f59e0b;
  color: #0f172a;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.download-button:hover {
  background: #d97706;
}
</style>
