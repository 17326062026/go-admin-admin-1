import { defineStore } from "pinia";
export const userRouteStore = defineStore("userRoute", {
  state: () => ({
    routesLoaded: false, //动态是否加载
  }),
  actions: {
    //设置是否已经加载过动态路由
    setRoutesLoaded(routesLoaded = false) {
      this.routesLoaded = routesLoaded;
    },
  },
});
