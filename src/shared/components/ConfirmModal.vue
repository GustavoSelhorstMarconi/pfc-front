<template>
  <div v-if="show" class="modal-overlay" @click="$emit('cancel')">
    <div class="confirm-modal" @click.stop>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>

      <div class="actions">
        <button class="cancel" @click="$emit('cancel')">
          Cancelar
        </button>
        <button class="confirm" @click="$emit('confirm')">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
  message: string;
}>();
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.confirm-modal {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  padding: 32px;
  border-radius: 14px;
  width: 420px;
  max-width: 95%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: scaleIn 0.2s ease;
}

.confirm-modal h3 {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
  /* vermelho ação destrutiva */
}

.confirm-modal p {
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.cancel {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #1f2937;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel:hover {
  background: #334155;
}

.confirm {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #ef4444;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.confirm:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* animações suaves */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>