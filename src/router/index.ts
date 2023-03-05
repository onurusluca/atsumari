import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/test',
      name: 'Test',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/tests/Test.vue'),
      meta: {
        needsAuth: true,
      },
    },

    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/RegisterView.vue'),
    },
    {
      path: '/account',
      name: 'Account',
      component: () => import('../views/auth/Account.vue'),
    },
  ],
})

// Check if the page requires authentication, if so, check if the user is logged in. If not, redirect to the home page.
router.beforeEach((to, from, next) => {
  const userSession = useAuthStore()

  if (to.meta.needsAuth) {
    if (userSession.session) {
      return next()
    } else {
      return next('/')
    }
  }

  return next()
})

export default router
