import axios from "axios";
import { ElMessage } from "element-plus";
import Cookies from "js-cookie";
import router from "../router";
import { useUserStore } from "../store/modules/user";
// 判断是否为开发环境
const isDev = import.meta.env.DEV;

const service = axios.create({
  // 在开发环境中使用代理
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 增加超时时间到30秒
  headers: {
    "Content-Type": "application/json",
  },
  // 允许跨域请求携带凭证
  // withCredentials: true,
});

// 添加一个随机参数，避免缓存问题
service.interceptors.request.use(
  (config) => {
    // 添加时间戳参数，避免缓存
    const timestamp = new Date().getTime();
    if (config.params) {
      config.params = { ...config.params, _t: timestamp };
    } else {
      config.params = { _t: timestamp };
    }

    // 获取 token，如果没有则使用固定的 token
    const token = Cookies.get("token") || "";
    const OAuthType = Cookies.get("OAuthType") || `Bearer`;
    // 设置 Authorization 头
    config.headers["Authorization"] = `${OAuthType} ${token}`;
    // 打印请求信息，便于调试
    console.log("Request:", {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    // 打印响应信息，便于调试
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    // 检查响应是否包含错误信息
    const responseData = response.data;

    // 如果响应中包含错误码且不是200，则认为请求失败
    if (responseData && responseData.code && responseData.code !== 200) {
      const errorMsg = responseData.msg || responseData.message || "请求失败";
      ElMessage.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    // 直接返回响应
    return response.data || {};
  },
  (error) => {
    console.error("API Error:", error);

    if (error.response) {
      console.error("Error response data:", error.response.data);
    }

    const { status } = error.response || {};
    console.error("API Error:----status", status);
    let message = "未知错误";
    switch (status) {
      case 401:
        message = "登录已过期，请重新登录";
        // 不要立即清除 token 和跳转，而是先检查是否有 token
        const userStore = useUserStore();
        userStore.logout();
        // 如果有 token，可能是其他原因导致的 401，给出提示但不强制跳转
        ElMessage.warning("请求授权失败，可能需要重新登录");

        break;
      case 403:
        message = "没有权限访问";
        break;
      case 404:
        message = "请求的资源不存在";
        break;
      case 500:
        message = "服务器错误";
        break;
      default:
        message =
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "请求失败";
    }

    if (status !== 401) {
      // 对于非 401 错误，显示错误消息
      ElMessage.error(message);
    }

    return Promise.reject(error);
  }
);
export default service;
