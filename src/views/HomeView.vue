<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.clearTokens()
  router.push('/login')
}
</script>

<template>
  <div class="home">
    <h1>Dashboard</h1>
    <button @click="logout">Sair</button>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 40px;
}

button {
  margin-top: 20px;
  padding: 10px 16px;
  background: #2563eb;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
</style>
