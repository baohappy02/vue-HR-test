import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Test from "../views/Test/index.vue";
import TotalCreated from "../views/TotalCreated/index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "Test",
    component: Test,
  },
  {
    path: "/total-created",
    name: "TotalCreated",
    component: TotalCreated,
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
