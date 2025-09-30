import { defineStore } from "pinia";
import { login as loginApi } from "@/api/auth";
import { getAdminInfo } from "@/api/admin";
import { getMenuList, createMenu, updateMenu, deleteMenu } from "@/api/menu";
import Cookies from "js-cookie";
import router from "@/router";
import { ElMessage } from "element-plus";
export function changeRouteFile(routes) {
  return routes.map((route) => ({
    ...route,
    title: route.menu_name,
    path: route.router_path,
    component: () => import(`@/views/${route.components}.vue`),
    children: route.children ? changeRouteFile(route.children) : [],
  }));
}
export const useUserStore = defineStore("user", {
  state: () => ({
    token: Cookies.get("token") || "",
    OAuthType: Cookies.get("OAuthType") || "",
    userInfo: null,
    role_id: 0,
    routesLoaded: false, //动态是否加载
    menusList: [],
  }),
  persist: { enabled: true }, // 启用持久化
  actions: {
    async login(data: { name: string; password: string }) {
      try {
        // 尝试调用登录API
        const response = await loginApi(data);
        console.log("尝试调用登录API", response);
        console.log("response.code", response.code);
        if (response.code === 200 && response.data) {
          let { token, userInfo, OAuthType, menusList = [] } = response.data;
          this.token = token;
          this.userInfo = userInfo;
          this.OAuthType = OAuthType;
          this.menusList = menusList;
          this.role_id = userInfo.role_id;
          this.routesLoaded = false;
          Cookies.set("token", token);
          Cookies.set("OAuthType", OAuthType);
          Cookies.set("userInfo", JSON.stringify(userInfo));
          Cookies.set("menusList", JSON.stringify(menusList));
          console.log("this.userInfo------------------", this.userInfo);
          ElMessage.success("登录成功");
          router.push("/");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Login error:", error);
        error instanceof Error ? error.message : "登录失败";
        return false;
      }
    },
    async getUserInfo() {
      const response = await getAdminInfo();
      console.log("尝试调用登录API", response);
      console.log("response.code", response.code);
      if (response.code === 200 && response.data) {
        this.userInfo = response.data;
        this.role_id = response.data.role_id;
      }
    },
    async updateMenusList() {
      const response = await getMenuList();
      if (response.code == 200) {
        this.menusList = response.data || [];
      }
    },
    // 添加模拟登录方法
    mockLogin() {
      try {
        // this.mockLoginData();

        // 如果当前在登录页，则跳转到首页
        if (router.currentRoute.value.path === "/login") {
          router.push("/");
        }

        return true;
      } catch (error) {
        console.error("模拟登录失败:", error);
        ElMessage.error("模拟登录失败");
        return false;
      }
    },

    // 模拟登录数据
    mockLoginData() {
      // 使用固定的token和用户信息
      this.token = FIXED_TOKEN;
      this.userInfo = {
        id: 1,
        name: "admin",
        mobile: "17326062026",
        email: "admin@example.com",
        avatar:
          "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        role_id: 1,
      };
    },

    // 更新用户信息
    updateUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },

    // 退出登录
    logout() {
      this.token = "";
      this.userInfo = null;
      Cookies.remove("token");
      Cookies.remove("OAuthType");
      Cookies.remove("userInfo");
      Cookies.remove("menusList");
      router.push("/login");
      ElMessage.success("已退出登录");
    },
  },
});
