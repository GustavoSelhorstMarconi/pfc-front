<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>{{ category ? 'Editar Categoria' : 'Nova Categoria' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Nome:</label>
          <input id="name" v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label for="type">Tipo:</label>
          <select id="type" v-model="form.type" :disabled="!!category" required>
            <option value="0">Receita</option>
            <option value="1">Despesa</option>
          </select>
        </div>
        <div v-if="category" class="form-group status-group">
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
        <div class="form-group">
          <label for="color">Cor:</label>
          <div class="color-input-group">
            <input id="color" v-model="form.color" type="color" class="color-picker" />
            <input v-model="form.color" type="text" placeholder="#000000" class="color-hex" />
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
import { ref, watch } from 'vue'
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types'

interface Props {
  category?: CategoryResponse | null
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [form: CreateCategoryRequest | UpdateCategoryRequest]
}>()

const form = ref({
  name: '',
  type: 0,
  color: '#ffffff',
  isActive: true,
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  if (props.category) {
    emit('save', { id: props.category.id, ...form.value })
  } else {
    emit('save', form.value)
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    type: 0,
    color: '#ffffff',
    isActive: true,
  }
}

watch(
  [() => props.category, () => props.show],
  ([newCategory, newShow]) => {
    if (!newShow) return
    if (newCategory) {
      form.value = {
        name: newCategory.name,
        type: newCategory.type,
        color: newCategory.color,
        isActive: newCategory.isActive,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)
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

.switch input:checked + .slider {
  background-color: #22c55e;
}

.switch input:checked + .slider:before {
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
