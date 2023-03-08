import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: {
        needsAuth: true,
      },
      children: [
        {
          path: 'space-edit/:id',
          name: 'Space Edit',
          component: () => import('../views/SpaceEdit.vue'),
        },
      ],
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

    // Room
    {
      path: '/room/:user_id/:id',
      name: 'Room',
      component: () => import('../views/Room.vue'),
      meta: {
        // needsAuth: true,
      },
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
