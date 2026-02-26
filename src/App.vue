<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <RouterView />
  <Toaster theme="dark" position="top-right" richColors closeButton />
</template>

<style>
html,
body,
#app {
  height: 100%;
  width: 100vw;
  margin: 0;
  padding: 0;
}
body {
  background: #0f172a;
}
</style>
