<template>
  <div class="skeleton-card">
    <div class="skeleton-title"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text short"></div>
    <div class="skeleton-button"></div>
  </div>
</template>

<style scoped>
.skeleton-card {
  width: 280px;
  padding: 20px;
  border-radius: 8px;
  background: #1f2937;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title,
.skeleton-text,
.skeleton-button {
  background: linear-gradient(90deg, #374151 25%, #4b5563 37%, #374151 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 6px;
}

.skeleton-title {
  height: 20px;
  width: 100%;
}

.skeleton-text {
  height: 16px;
  width: 70%;
}

.skeleton-text.short {
  width: 40%;
}

.skeleton-button {
  height: 36px;
  width: 100px;
  margin-top: auto;
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