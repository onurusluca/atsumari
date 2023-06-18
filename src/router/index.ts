import { createRouter, createWebHistory } from "vue-router";

import HomeView from "@/views/Home.vue";
import NotFound from "@/views/404.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
      meta: {
        needsAuth: true,
      },
      /*children: [
      ],
      */
    },

    // Space settings
    {
      path: "/space-settings/:id/:name",
      name: "SpaceSettings",
      component: () => import("@/views/space-settings/SpaceSettings.vue"),
    },
    {
      path: "/space-settings/:id/:name/access",
      name: "Access",
      component: () => import("@/views/space-settings/SpaceAccess.vue"),
    },
    {
      path: "/space-settings/:id/:name/delete-shutdown",
      name: "DeleteShutdown",
      component: () => import("@/views/space-settings/SpaceDeleteShutDown.vue"),
    },
    // end space settings

    // Map
    {
      path: "/space-edit/:id",
      name: "Space Edit",
      component: () => import("@/views/space-settings/SpaceSettings.vue"),
    },

    // Auth
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/auth/LoginView.vue"),
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("@/views/auth/RegisterView.vue"),
    },
    {
      path: "/forgot-password",
      name: "ForgotPassword",
      component: () => import("@/views/auth/ForgotPassword.vue"),
      props: (route) => ({
        newPassword: route.query.new_password,
        email: route.query.email,
      }),
    },
    /*    {
      path: "/account",
      name: "Account",
      component: () => import("@/views/auth/Account.vue"),
    }, */
    // end auth

    // Space (room)
    {
      path: "/space/:id/:name",
      name: "Space",
      component: () => import("@/views/Space.vue"),
      meta: {
        // needsAuth: true,
      },
    },

    // Upgrade
    {
      path: "/upgrade",
      name: "Upgrade",
      component: () => import("@/views/UpgradeSpace.vue"),
      meta: {
        needsAuth: true,
      },
    },

    // 404
    { name: "404", path: "/:pathMatch(.*)*", component: NotFound },
  ],
});

// Check if the page requires authentication, if so, check if the user is logged in. If not, redirect to the home page.
router.beforeEach((to, from, next) => {
  const userSession = useAuthStore();

  if (to.meta.needsAuth) {
    if (userSession.session) {
      return next();
    } else {
      return next("/");
    }
  }

  return next();
});

export default router;
