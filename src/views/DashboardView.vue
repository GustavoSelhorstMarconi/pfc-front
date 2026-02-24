<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Bem-vindo ao seu painel financeiro pessoal!</p>
    <div class="stats">
      <div class="stat-card">
        <h3>Saldo Total</h3>
        <p>R$ 0,00</p>
      </div>
      <div class="stat-card">
        <h3>Receitas</h3>
        <p>R$ 0,00</p>
      </div>
      <div class="stat-card">
        <h3>Despesas</h3>
        <p>R$ 0,00</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #cbd5e1;
}

.stat-card p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
}
</style>
