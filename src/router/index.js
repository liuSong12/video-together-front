import { createRouter, createWebHashHistory } from "vue-router"
import route from "./config"
import { useRouterStore } from "../store/isGetRouter"

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue")
  }
]

let router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === "/login") {
    next()
  } else {
    if (!localStorage.getItem("token")) {
      next({
        path: "/login"
      })
    } else {
      const routerStore = useRouterStore()
      if (!routerStore.isGetterRouter) {
        router.removeRoute("mainbox")
        router.addRoute({
          path: "/mainbox",
          name: "mainbox",
          component: () => import('../views/MainBox.vue')
        })
        route.forEach(item => {
          router.addRoute("mainBox", item)
        })
        const routerStore = useRouterStore()
        routerStore.changeIsGetterRouter(true)
        next({
          path: to.fullPath
        })
      } else {
        next()
      }
    }
  }
})





export default router