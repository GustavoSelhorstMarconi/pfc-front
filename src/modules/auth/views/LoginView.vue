<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '../services/auth.service'
import { useApi } from '@/core/composables/useApi'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const { loading, error, execute, data } = useApi(() =>
  authService.login({
    email: email.value,
    password: password.value,
  }),
)

const handleLogin = async () => {
  await execute()

  if (data.value) {
    authStore.setTokens(data.value.accessToken, data.value.refreshToken)

    router.push('/')
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Bem-vindo</h1>
      <p class="subtitle">Faça login para continuar</p>

      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="seu@email.com" required />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>

        <button class="login-button" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  font-family: Arial, sans-serif;
}

.login-card {
  background: #111827;
  padding: 40px;
  width: 380px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.title {
  color: #3b82f6;
  margin-bottom: 8px;
  text-align: center;
}

.subtitle {
  color: #9ca3af;
  margin-bottom: 24px;
  text-align: center;
  font-size: 14px;
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

input {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #334155;
  background-color: #1f2937;
  color: white;
  outline: none;
  transition: border 0.2s;
}

input:focus {
  border-color: #3b82f6;
}

.login-button {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: none;
  background-color: #2563eb;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover {
  background-color: #1d4ed8;
}

.login-button:disabled {
  background-color: #334155;
  cursor: not-allowed;
}

.error {
  margin-top: 16px;
  color: #ef4444;
  font-size: 14px;
  text-align: center;
}
</style>
