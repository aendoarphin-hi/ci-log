import { createRouter, createWebHistory } from "vue-router";
import RequestView from "../views/RequestView.vue";
import axios from "axios";
import { store } from "../common/store.js";

const routes = [
  {
    path: "/",
    name: "Requests",
    component: RequestView,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: () => import("../views/UnauthorizedView.vue"),
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

router.beforeEach(async (to) => {
  store.userAuth = (await axios.get(`${process.env.BASE_URL}api/?auth`)).data;

  // already logged in
  if (store.userAuth.id && to.name === "Login") {
    return "/";
  }

  // not logged in
  if (!store.userAuth.id && to.name !== "Login") {
    return "/login";
  }

  // not in required group
  if (
    store.userAuth.id &&
    to.name !== "Unauthorized" &&
    !Object.values(store.userAuth.groups).includes("Continuous Improvement")
  ) {
    return "/unauthorized";
  }

  document.title = `${to.name} | Continuous Improvement`;
});

export default router;
