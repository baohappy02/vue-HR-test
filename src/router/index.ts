import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Test from "../views/Test/index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Test",
    component: Test,
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;