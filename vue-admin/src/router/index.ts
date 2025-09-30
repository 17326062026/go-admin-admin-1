import { createRouter, createWebHistory,createWebHashHistory } from "vue-router";
import Layout from "../layout/index.vue";
import Cookies from "js-cookie";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { userRouteStore } from "@/store/modules/userRoute";
import { transformRoutes } from "@/utils";

// 1. 定义静态路由
const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "首页", icon: "Odometer", affix: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/views/error/404.vue"),
    meta: { title: "404 - 页面不存在", hidden: true },
  },
];

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes: constantRoutes,
});

// 转换函数

// 3. 动态添加路由的函数
export function addDynamicRoutes(menusList) {
  // 通常从接口获取动态路由配置
  let routes = transformRoutes(menusList);
  routes.forEach((route) => {
    // 使用 addRoute 方法添加路由
    router.addRoute(route);
  });
}

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 后台管理系统`
    : "后台管理系统";
  //userStore.setRoutesLoaded(false);
  //没有登录的情况
  const userStore = useUserStore();
  const routeStore = userRouteStore();

  // 3. 检查是否已加载动态路由
  if (!routeStore.routesLoaded) {
    let { menusList = [] ,token=''} = userStore;
    if (menusList.length == 0) {
      let strMenusList = Cookies.get("menusList") || "[]";
      menusList = JSON.parse(strMenusList);
    }
    if (menusList.length == 0 && token) {
      await userStore.updateMenusList();
      menusList = userStore.menusList;
    }
    await addDynamicRoutes(menusList);
    routeStore.setRoutesLoaded(true);
    return next(to.path); // 重新导航
  }
  // 如果是需要认证的路由，检查登录状态
  if (to.meta.requiresAuth) {
    // 始终使用固定的token
    next();
    return;
  }
  if (to.path == "/login") {
    return next();
  }
  if (!userStore.token) {
    return next("/login");
  }
  // 如果已登录且访问登录页，重定向到首页
  if (to.path === "/login" && Cookies.get("token")) {
    next("/");
    return;
  }
  next();
});

export default router;
