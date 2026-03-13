<template>
  <div class="data-table-wrapper">
    <div class="table-toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar..."
          :value="search"
          @input="onSearchInput"
        />
      </div>
      <div class="page-size-box">
        <label>Itens por página:</label>
        <select :value="pageSize" @change="onPageSizeChange">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['col-header', col.sortable ? 'sortable' : '', col.align ?? 'left']"
              @click="col.sortable ? onSort(col.sortKey ?? col.key) : undefined"
            >
              {{ col.label }}
              <span v-if="col.sortable" class="sort-icon">
                <template v-if="sortBy === (col.sortKey ?? col.key)">
                  {{ sortDir === 'asc' ? '↑' : '↓' }}
                </template>
                <template v-else>⇅</template>
              </span>
            </th>
            <th v-if="$slots.actions" class="col-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="loading-cell">
              Carregando...
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty-cell">
              Nenhum resultado encontrado.
            </td>
          </tr>
          <tr v-else v-for="(row, i) in data" :key="i" class="data-row">
            <td
              v-for="col in columns"
              :key="col.key"
              :class="col.align ?? 'left'"
            >
              <slot :name="`cell-${col.key}`" :value="getNestedValue(row, col.key)" :row="row">
                {{ col.format ? col.format(getNestedValue(row, col.key), row) : getNestedValue(row, col.key) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="col-actions">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="pagination-info">
        <template v-if="totalCount > 0">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalCount) }} de {{ totalCount }}
        </template>
        <template v-else>Nenhum resultado</template>
      </span>
      <div class="pagination-controls">
        <button :disabled="currentPage <= 1" @click="onPage(currentPage - 1)">◀ Anterior</button>
        <span class="page-indicator">{{ currentPage }} de {{ totalPages }}</span>
        <button :disabled="currentPage >= totalPages" @click="onPage(currentPage + 1)">Próxima ▶</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'

export interface ColumnDef {
  key: string
  label: string
  sortable?: boolean
  sortKey?: string
  format?: (value: unknown, row: Record<string, unknown>) => string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: ColumnDef[]
  data: T[]
  totalCount: number
  currentPage: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  search: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  'update:sortBy': [key: string]
  'update:sortDir': [dir: 'asc' | 'desc']
  'update:search': [value: string]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalCount / props.pageSize)))

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const onSearchInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    emit('update:search', value)
    emit('update:currentPage', 1)
  }, 300)
}

const onSort = (key: string) => {
  if (props.sortBy === key) {
    emit('update:sortDir', props.sortDir === 'asc' ? 'desc' : 'asc')
  } else {
    emit('update:sortBy', key)
    emit('update:sortDir', 'asc')
  }
  emit('update:currentPage', 1)
}

const onPage = (page: number) => {
  emit('update:currentPage', page)
}

const onPageSizeChange = (e: Event) => {
  emit('update:pageSize', Number((e.target as HTMLSelectElement).value))
  emit('update:currentPage', 1)
}

const getNestedValue = (obj: Record<string, unknown>, key: string): unknown => {
  return key.split('.').reduce((o: unknown, k: string) => (o != null ? (o as Record<string, unknown>)[k] : undefined), obj)
}
</script>

<style scoped>
.data-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1f2937;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 12px;
  flex: 1;
  max-width: 360px;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  width: 100%;
}

.search-icon {
  font-size: 14px;
  opacity: 0.6;
}

.page-size-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #cbd5e1;
}

.page-size-box select {
  background: #1f2937;
  border: 1px solid #334155;
  border-radius: 6px;
  color: white;
  padding: 6px 10px;
  outline: none;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #1f2937;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: #1f2937;
}

th {
  padding: 12px 16px;
  color: #94a3b8;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  user-select: none;
}

th.sortable {
  cursor: pointer;
}

th.sortable:hover {
  color: #e2e8f0;
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.7;
}

td {
  padding: 12px 16px;
  border-top: 1px solid #1f2937;
  color: #e2e8f0;
  vertical-align: middle;
}

.data-row:hover td {
  background: #1a2332;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 32px;
  color: #64748b;
}

.col-actions {
  text-align: right;
  white-space: nowrap;
}

.left { text-align: left; }
.center { text-align: center; }
.right { text-align: right; }

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 13px;
  color: #94a3b8;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-controls button {
  background: #1f2937;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination-controls button:hover:not(:disabled) {
  background: #334155;
}

.pagination-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 13px;
  color: #94a3b8;
  min-width: 80px;
  text-align: center;
}
</style>
