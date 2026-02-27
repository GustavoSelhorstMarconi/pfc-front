<template>
  <div class="goals-view">
    <h1>Metas</h1>

    <button class="add-button" @click="openCreateModal">Adicionar Nova Meta</button>

    <div class="goals-grid">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-button"></div>
        </div>
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

    <GoalModal
      :show="showModal"
      :goal="selectedGoal"
      @close="showModal = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@/core/composables/useApi'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import GoalModal from '../components/GoalModal.vue'
import { goalService } from '../services/goal.service'
import type { CreateGoalRequest, GoalResponse, UpdateGoalRequest } from '../types/goal.types'

const goals = ref<GoalResponse[]>([])
const showModal = ref(false)
const selectedGoal = ref<GoalResponse | null>(null)

const {
  execute: getGoals,
  data,
  loading,
  error: errorGetGoals,
} = useApi<GoalResponse[]>(() => goalService.get())

const {
  execute: createGoal,
  data: createdGoal,
  error: errorCreateGoal,
} = useApi<GoalResponse, CreateGoalRequest>((goal) => goalService.create(goal))

const {
  execute: updateGoal,
  data: updatedGoal,
  error: errorUpdateGoal,
} = useApi<GoalResponse, UpdateGoalRequest>((goal) => goalService.update(goal.id, goal))

const handleGetGoals = async () => {
  await getGoals()

  if (data.value) {
    goals.value = data.value
  }

  if (errorGetGoals.value) {
    toast.error('Erro ao carregar metas: ' + (errorGetGoals.value?.detail ?? 'Erro desconhecido'))
  }
}

const handleSave = async (form: CreateGoalRequest | UpdateGoalRequest) => {
  if ('id' in form) {
    await updateGoal(form)

    if (errorUpdateGoal.value) {
      toast.error(
        'Erro ao atualizar meta: ' + (errorUpdateGoal.value?.detail ?? 'Erro desconhecido'),
      )
    } else if (updatedGoal.value) {
      toast.success('Meta atualizada com sucesso!')
      await handleGetGoals()
    }
  } else {
    await createGoal(form)

    if (errorCreateGoal.value) {
      toast.error('Erro ao criar meta: ' + (errorCreateGoal.value?.detail ?? 'Erro desconhecido'))
    } else if (createdGoal.value) {
      toast.success('Meta criada com sucesso!')
      await handleGetGoals()
    }
  }

  selectedGoal.value = null
}

const openCreateModal = () => {
  selectedGoal.value = null
  showModal.value = true
}

const editGoal = (goal: GoalResponse) => {
  selectedGoal.value = goal
  showModal.value = true
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (date: string) => {
  return date.split('-').reverse().join('/')
}

onMounted(async () => {
  await handleGetGoals()
})
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
  border-radius: 8px;
  padding: 20px;
  background-color: #1f2937;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.card-actions {
  margin-top: auto;
}

.edit-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid white;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}
</style>
