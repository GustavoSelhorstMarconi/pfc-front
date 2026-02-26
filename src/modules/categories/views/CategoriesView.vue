<template>
  <div class="categories-view">
    <h1>Categorias</h1>
    <button class="add-button" @click="showModal = true">Adicionar Nova Categoria</button>
    <div class="categories-grid">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-button"></div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          :style="{ backgroundColor: category.color }"
        >
          <h3>{{ category.name }}</h3>
          <div class="category-meta">
            <p>{{ category.type === 0 ? 'Receita' : 'Despesa' }}</p>
            <span class="status-badge" :class="category.isActive ? 'active' : 'inactive'">
              {{ category.isActive ? 'Ativa' : 'Inativa' }}
            </span>
          </div>
          <div class="card-actions">
            <button class="edit-button" @click="editCategory(category)">Editar</button>
          </div>
        </div>
      </template>
    </div>
    <CategoryModal
      :show="showModal"
      :category="selectedCategory"
      @close="showModal = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import CategoryModal from '../components/CategoryModal.vue'
import { categoryService } from '../services/category.service'
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types'

const categories = ref<CategoryResponse[]>([])
const showModal = ref(false)
const selectedCategory = ref<CategoryResponse | null>(null)

const {
  execute: getCategories,
  data,
  loading,
  error: errorGetCategories,
} = useApi<CategoryResponse[]>(() => categoryService.get())
const {
  execute: createCategory,
  data: createdCategory,
  error: errorCreateCategory,
} = useApi<CategoryResponse, CreateCategoryRequest>((category: CreateCategoryRequest) =>
  categoryService.create(category),
)
const {
  execute: updateCategory,
  data: updatedCategory,
  error: errorUpdateCategory,
} = useApi<CategoryResponse, UpdateCategoryRequest>((category: UpdateCategoryRequest) =>
  categoryService.update(category.id, category),
)

const handleSave = async (form: CreateCategoryRequest | UpdateCategoryRequest) => {
  if ('id' in form) {
    await updateCategory(form)

    if (errorUpdateCategory.value) {
      toast.error(
        'Erro ao atualizar categoria: ' +
          (errorUpdateCategory.value?.detail ?? 'Erro desconhecido'),
      )
    } else if (updatedCategory.value) {
      toast.success('Categoria atualizada com sucesso!')
      await handleGetCategories()
    }
  } else {
    await createCategory(form)

    if (errorCreateCategory.value) {
      toast.error(
        'Erro ao criar categoria: ' + (errorCreateCategory.value?.detail ?? 'Erro desconhecido'),
      )
    } else if (createdCategory.value) {
      toast.success('Categoria criada com sucesso!')
      await handleGetCategories()
    }
  }

  selectedCategory.value = null
}

onMounted(async () => {
  await handleGetCategories()
})

const handleGetCategories = async () => {
  await getCategories()

  if (data.value) {
    categories.value = data.value
  }

  if (errorGetCategories.value) {
    toast.error(
      'Erro ao carregar categorias: ' + (errorGetCategories.value?.detail ?? 'Erro desconhecido'),
    )
  }
}

const editCategory = (category: CategoryResponse) => {
  selectedCategory.value = category
  showModal.value = true
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
  overflow: hidden;
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

.category-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.category-meta p {
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
