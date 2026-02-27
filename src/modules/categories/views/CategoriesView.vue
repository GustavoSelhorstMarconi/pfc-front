<template>
  <div class="categories-view">
    <h1>Categorias</h1>
    <button class="add-button" @click="openCreateModal">Adicionar Nova Categoria</button>
    <div class="categories-grid">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div v-for="category in categories" :key="category.id" class="category-card"
          :style="getGradient(category.color)">
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
    <CategoryModal :show="showModal" :category="selectedCategory" @close="showModal = false" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import CategoryModal from '../components/CategoryModal.vue';
import { categoryService } from '../services/category.service';
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

const categories = ref<CategoryResponse[]>([]);
const showModal = ref(false);
const selectedCategory = ref<CategoryResponse | null>(null);

const {
  execute: getCategories,
  data,
  loading,
  error: errorGetCategories,
} = useApi<CategoryResponse[]>(() => categoryService.get());
const {
  execute: createCategory,
  data: createdCategory,
  error: errorCreateCategory,
} = useApi<CategoryResponse, CreateCategoryRequest>((category: CreateCategoryRequest) =>
  categoryService.create(category),
);
const {
  execute: updateCategory,
  data: updatedCategory,
  error: errorUpdateCategory,
} = useApi<CategoryResponse, UpdateCategoryRequest>((category: UpdateCategoryRequest) =>
  categoryService.update(category.id, category),
);

const handleSave = async (form: CreateCategoryRequest | UpdateCategoryRequest) => {
  if ('id' in form) {
    await updateCategory(form);

    if (errorUpdateCategory.value) {
      toast.error(
        'Erro ao atualizar categoria: ' +
        (errorUpdateCategory.value?.detail ?? 'Erro desconhecido'),
      );
    } else if (updatedCategory.value) {
      toast.success('Categoria atualizada com sucesso!');
      await handleGetCategories();
    }
  } else {
    await createCategory(form);

    if (errorCreateCategory.value) {
      toast.error(
        'Erro ao criar categoria: ' + (errorCreateCategory.value?.detail ?? 'Erro desconhecido'),
      );
    } else if (createdCategory.value) {
      toast.success('Categoria criada com sucesso!');
      await handleGetCategories();
    }
  }

  selectedCategory.value = null;
};

onMounted(async () => {
  await handleGetCategories();
});

const handleGetCategories = async () => {
  await getCategories();

  if (data.value) {
    categories.value = data.value;
  }

  if (errorGetCategories.value) {
    toast.error(
      'Erro ao carregar categorias: ' + (errorGetCategories.value?.detail ?? 'Erro desconhecido'),
    );
  }
};

const openCreateModal = () => {
  selectedCategory.value = null;
  showModal.value = true;
};

const editCategory = (category: CategoryResponse) => {
  selectedCategory.value = category;
  showModal.value = true;
};

const adjustColor = (color: string, amount: number) => {
  let usePound = false;

  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);

  return (
    (usePound ? "#" : "") +
    (r << 16 | g << 8 | b)
      .toString(16)
      .padStart(6, "0")
  );
};

const getGradient = (color: string) => {
  const lighter = adjustColor(color, 40);
  const darker = adjustColor(color, -40);

  return {
    background: `linear-gradient(135deg, ${lighter}, ${darker})`
  };
};
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
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 30px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.4);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.category-card {
  border-radius: 14px;
  padding: 22px;
  color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.category-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 0;
}

.category-card>* {
  position: relative;
  z-index: 1;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
}

.category-card h3 {
  margin: 0 0 14px 0;
  font-size: 18px;
  font-weight: 600;
}

.category-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.category-meta p {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  opacity: 0.9;
}

.status-badge {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background-color: #22c55e;
  color: white;
}

.status-badge.inactive {
  background-color: #ef4444;
  color: white;
}

.card-actions {
  display: flex;
  justify-content: center;
  margin-top: auto;
}

.edit-button {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: rgba(37, 99, 235, 0.15);
  color: white;
  font-weight: 600;
  transition: background 0.2s ease;
}

.edit-button:hover {
  background-color: #1d4ed8;
}
</style>
