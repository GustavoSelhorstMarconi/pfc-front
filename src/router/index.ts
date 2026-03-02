import AccountsView from '@/modules/accounts/views/AccountsView.vue';
import LoginView from '@/modules/auth/views/LoginView.vue';
import RegisterView from '@/modules/auth/views/RegisterView.vue';
import CategoriesView from '@/modules/categories/views/CategoriesView.vue';
import DebtsView from '@/modules/debts/views/DebtsView.vue';
import GoalsView from '@/modules/goals/views/GoalsView.vue';
import RecurrencesPendingView from '@/modules/recurrences/views/RecurrencesPendingView.vue';
import RecurrencesView from '@/modules/recurrences/views/RecurrencesView.vue';
import TransactionsView from '@/modules/transactions/views/TransactionsView.vue';
import { useAuthStore } from '@/stores/auth.store';
import DashboardView from '@/views/DashboardView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

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
          component: CategoriesView,
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: TransactionsView,
        },
        {
          path: 'accounts',
          name: 'accounts',
          component: AccountsView,
        },
        {
          path: 'debts',
          name: 'debts',
          component: DebtsView,
        },
        {
          path: 'goals',
          name: 'goals',
          component: GoalsView,
        },
        {
          path: 'recurrences',
          name: 'recurrences',
          component: RecurrencesView,
        },
        {
          path: 'profile',
          name: 'profile',
          component: DashboardView,
        },
        {
          path: 'recurrences-pending',
          name: 'recurrences-pending',
          component: RecurrencesPendingView
        }
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
