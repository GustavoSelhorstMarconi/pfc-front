<template>
  <div class="goals-view">
    <h1>Metas</h1>

    <button class="add-button" @click="openCreateModal">Adicionar Nova Meta</button>

    <div class="goals-grid">
      <template v-if="loading">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <template v-else>
        <div v-for="goal in goals" :key="goal.id" class="goal-card">
          <h3>{{ goal.name }}</h3>

          <div class="goal-values">
            <p><strong>Meta:</strong> {{ formatCurrency(goal.targetAmount) }}</p>
            <p><strong>Atual:</strong> {{ formatCurrency(goal.currentAmount) }}</p>
          </div>

          <div v-if="goal.deadline" class="goal-deadline">
            Prazo: {{ formatDate(goal.deadline) }}
          </div>

          <span class="status-badge" :class="goal.isActive ? 'active' : 'inactive'">
            {{ goal.isActive ? 'Ativa' : 'Inativa' }}
          </span>

          <div class="card-actions">
            <button class="edit-button" @click="editGoal(goal)">Editar</button>
          </div>
        </div>
      </template>
    </div>

    <GoalModal :show="showModal" :goal="selectedGoal" @close="showModal = false" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import SkeletonCard from '@/shared/components/SkeletonCard.vue';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import GoalModal from '../components/GoalModal.vue';
import { goalService } from '../services/goal.service';
import type { CreateGoalRequest, GoalResponse, UpdateGoalRequest } from '../types/goal.types';

const goals = ref<GoalResponse[]>([]);
const showModal = ref(false);
const selectedGoal = ref<GoalResponse | null>(null);

const {
  execute: getGoals,
  data,
  loading,
  error: errorGetGoals,
} = useApi<GoalResponse[]>(() => goalService.get());

const {
  execute: createGoal,
  data: createdGoal,
  error: errorCreateGoal,
} = useApi<GoalResponse, CreateGoalRequest>((goal) => goalService.create(goal));

const {
  execute: updateGoal,
  data: updatedGoal,
  error: errorUpdateGoal,
} = useApi<GoalResponse, UpdateGoalRequest>((goal) => goalService.update(goal.id, goal));

const handleGetGoals = async () => {
  await getGoals();

  if (data.value) {
    goals.value = data.value;
  }

  if (errorGetGoals.value) {
    toast.error('Erro ao carregar metas: ' + (errorGetGoals.value?.detail ?? 'Erro desconhecido'));
  }
};

const handleSave = async (form: CreateGoalRequest | UpdateGoalRequest) => {
  if ('id' in form) {
    await updateGoal(form);

    if (errorUpdateGoal.value) {
      toast.error(
        'Erro ao atualizar meta: ' + (errorUpdateGoal.value?.detail ?? 'Erro desconhecido'),
      );
    } else if (updatedGoal.value) {
      toast.success('Meta atualizada com sucesso!');
      showModal.value = false;
      selectedGoal.value = null;
      await handleGetGoals();
    }
  } else {
    await createGoal(form);

    if (errorCreateGoal.value) {
      toast.error('Erro ao criar meta: ' + (errorCreateGoal.value?.detail ?? 'Erro desconhecido'));
    } else if (createdGoal.value) {
      toast.success('Meta criada com sucesso!');
      showModal.value = false;
      selectedGoal.value = null;
      await handleGetGoals();
    }
  }
};

const openCreateModal = () => {
  selectedGoal.value = null;
  showModal.value = true;
};

const editGoal = (goal: GoalResponse) => {
  selectedGoal.value = goal;
  showModal.value = true;
};


onMounted(async () => {
  await handleGetGoals();
});
</script>

<style scoped>
.goals-view {
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
}

.goals-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.goal-card {
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

.goal-card:hover {
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
