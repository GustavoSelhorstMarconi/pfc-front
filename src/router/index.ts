import LoginView from '@/modules/auth/views/LoginView.vue'
import RegisterView from '@/modules/auth/views/RegisterView.vue'
import { useAuthStore } from '@/stores/auth.store'
import DashboardView from '@/views/DashboardView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/',
      component: HomeView,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'categories',
          name: 'categories',
          component: DashboardView,
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: DashboardView,
        },
        {
          path: 'accounts',
          name: 'accounts',
          component: DashboardView,
        },
        {
          path: 'debts',
          name: 'debts',
          component: DashboardView,
        },
        {
          path: 'goals',
          name: 'goals',
          component: DashboardView,
        },
        {
          path: 'recurrences',
          name: 'recurrences',
          component: DashboardView,
        },
        {
          path: 'profile',
          name: 'profile',
          component: DashboardView,
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
