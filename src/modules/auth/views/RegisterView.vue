<script setup lang="ts">
import { useApi } from '@/core/composables/useApi'
import { useAuthStore } from '@/stores/auth.store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth.service'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const { loading, error, execute, data } = useApi(() =>
  authService.register({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  }),
)

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem'
    return
  }

  await execute()

  if (data.value) {
    authStore.setTokens(data.value.accessToken, data.value.refreshToken)

    router.push('/')
  }

  if (error.value) {
    errorMessage.value = error.value.detail || 'Erro ao registrar usuário'
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="title">Criar Conta</h1>
      <p class="subtitle">Registre-se para acessar o sistema</p>

      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label>Nome</label>
          <input v-model="name" type="text" placeholder="Seu nome completo" required />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="seu@email.com" required />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>

        <div class="form-group">
          <label>Confirmar Senha</label>
          <input v-model="confirmPassword" type="password" placeholder="••••••••" required />
        </div>

        <button class="register-button" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>

        <p v-if="error" class="error">
          {{ errorMessage }}
        </p>
      </form>

      <p class="link">Já tem uma conta? <router-link to="/login">Faça login</router-link></p>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  font-family: Arial, sans-serif;
}

.register-card {
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

.register-button {
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

.register-button:hover {
  background-color: #1d4ed8;
}

.register-button:disabled {
  background-color: #334155;
  cursor: not-allowed;
}

.error {
  margin-top: 16px;
  color: #ef4444;
  font-size: 14px;
  text-align: center;
}

.link {
  margin-top: 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.link a {
  color: #3b82f6;
  text-decoration: none;
}

.link a:hover {
  text-decoration: underline;
}
</style>
