<template>
  <div class="categories-view">
    <h1>Categorias</h1>
    <button class="add-button" @click="showModal = true">Adicionar Nova Categoria</button>
    <div class="categories-grid">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        :style="{ backgroundColor: category.color }"
      >
        <h3>{{ category.name }}</h3>
        <p>{{ category.type === 0 ? 'Receita' : 'Despesa' }}</p>
        <button class="edit-button">Editar</button>
      </div>
    </div>
    <CategoryModal :show="showModal" @close="showModal = false" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi'
import { onMounted, ref } from 'vue'
import CategoryModal from '../components/CategoryModal.vue'
import { categoryService } from '../services/category.service'
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types'

const categories = ref<CategoryResponse[]>([])
const showModal = ref(false)

const { execute: getCategories, data } = useApi<CategoryResponse[]>(() => categoryService.get())
const { execute: createCategory, data: createdCategory } = useApi<
  CategoryResponse,
  CreateCategoryRequest
>((category: CreateCategoryRequest) => categoryService.create(category))
const { execute: updateCategory, data: updatedCategory } = useApi<
  CategoryResponse,
  UpdateCategoryRequest
>((category: UpdateCategoryRequest) => categoryService.update(category.id, category))

const handleSave = async (form: CreateCategoryRequest | UpdateCategoryRequest) => {
  if ('id' in form) {
    await updateCategory(form)

    if (updatedCategory.value) {
      await getCategories()
    }
  } else {
    await createCategory(form)

    if (createdCategory.value) {
      await handleGetCategories()
    }
  }
}

onMounted(async () => {
  await handleGetCategories()
})

const handleGetCategories = async () => {
  await getCategories()

  if (data.value) {
    categories.value = data.value
  }
}
</script>

<style scoped>
.categories-view {
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

.categories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.category-card {
  width: 280px;
  border-radius: 8px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-card h3 {
  margin: 0 0 10px 0;
}

.category-card p {
  margin: 0 0 20px 0;
}

.edit-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  padding: 8px 16px;
  cursor: pointer;
  align-self: flex-start;
  border-radius: 4px;
  transition: background 0.2s;
}

.edit-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
