<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-banner">
        <img src="https://api.jiawuyuan.cn/static/img/login-bg.svg" alt="Login Background" class="login-bg-image" />
        <div class="banner-content">
          <h2>后台管理系统</h2>
          <p>高效、安全、专业的管理解决方案</p>
        </div>
      </div>

      <div class="login-form-container">
        <div class="login-header">
          <h2 class="login-title">欢迎登录</h2>
          <p class="login-subtitle">请输入您的账号信息</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="name">
            <el-input v-model="loginForm.name" placeholder="用户名" :prefix-icon="User" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="密码" :prefix-icon="Lock" size="large" @keyup.enter="handleLogin" />
          </el-form-item>

          <!-- <div class="remember-forgot">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="javascript:void(0)" class="forgot-link">忘记密码?</a>
          </div> -->

          <el-form-item>
            <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin" size="large">
              登录
            </el-button>
          </el-form-item>

          <div class="login-debug-info" v-if="debugInfo">
            <pre>{{ debugInfo }}</pre>
          </div>

          <!-- 添加模拟登录按钮，用于测试 -->
          <!-- <div class="mock-login">
            <el-button type="info" @click="mockLogin" size="small">
              模拟登录
            </el-button>
          </div> -->
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { FormInstance } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { User, Lock } from "@element-plus/icons-vue";
import Cookies from "js-cookie";
import router from "@/router";
import { ElMessage } from "element-plus";
import { userRouteStore } from "@/store/modules/userRoute";
const userStore = useUserStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);
const debugInfo = ref("");
const routeStore = userRouteStore();
const loginForm = reactive({
  name: "", // 默认填写 admin
  password: "", // 默认填写 123456
});

const loginRules = {
  name: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" },
  ],
};

// 在组件挂载时检查是否已登录
onMounted(() => {
  const token = Cookies.get("token");
  if (token) {
    router.push("/");
  }
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    loading.value = true;
    await loginFormRef.value.validate();

    // 清除调试信息
    debugInfo.value = "";

    // 使用 store 中的登录方法
    const success = await userStore.login({
      name: loginForm.name,
      password: loginForm.password,
    });
    routeStore.setRoutesLoaded(false);
    if (success) {
      debugInfo.value = "登录成功";
      router.push("/");
    }
  } catch (error) {
    console.error("登录失败:", error);

    // 显示调试信息
    if (error instanceof Error) {
      debugInfo.value = `错误: ${error.message}`;
    } else {
      debugInfo.value = `未知错误: ${JSON.stringify(error)}`;
    }
  } finally {
    loading.value = false;
  }
};

// 模拟登录功能，使用后端提供的数据格式
const mockLogin = () => {
  try {
    // 使用 store 中的模拟登录方法
    const success = userStore.mockLogin();

    if (success) {
      debugInfo.value = "模拟登录成功，使用了后端提供的数据格式";
    }
  } catch (error) {
    console.error("模拟登录失败:", error);
    ElMessage.error("模拟登录失败");
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  overflow: hidden;
}

.login-box {
  width: 900px;
  height: 560px;
  display: flex;
  border-radius: 12px;
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  overflow: hidden;
}

.login-banner {
  flex: 1.2;
  background: linear-gradient(135deg, #1890ff 0%, #36cbcb 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.2;
}

.banner-content {
  text-align: center;
  position: relative;
  z-index: 10;
  padding: 0 40px;

  h2 {
    font-size: 32px;
    margin-bottom: 16px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  p {
    font-size: 18px;
    opacity: 0.9;
    line-height: 1.6;
    color: #ffffff;
  }
}

.login-form-container {
  flex: 0.8;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #fff;
}

.login-header {
  margin-bottom: 40px;
}

.login-title {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 600;
}

.login-subtitle {
  color: #909399;
  font-size: 16px;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  margin-top: 10px;
  border-radius: 6px;
  background: linear-gradient(to right, #1890ff, #36cbcb);
  border: none;

  &:hover,
  &:focus {
    background: linear-gradient(to right, #0c7ad9, #2bb7b7);
    border: none;
  }
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #606266;
}

.forgot-link {
  color: #409eff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.login-debug-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  max-height: 150px;
  overflow: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
  }
}

.mock-login {
  margin-top: 10px;
  text-align: center;
}

@media screen and (max-width: 992px) {
  .login-box {
    width: 90%;
    max-width: 500px;
    height: auto;
    flex-direction: column-reverse;
  }

  .login-banner {
    padding: 40px 20px;
  }
}
</style>