<template>
  <div class="app-wrapper">
    <div class="sidebar-container" :class="{ 'is-collapsed': !sidebar.opened }">
      <div class="logo">
        <span>后台管理系统</span>
      </div>
      <el-menu :collapse="!sidebar.opened" :default-active="route.path" background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" :collapse-transition="false" :unique-opened="true" router>
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" :is-collapse="!sidebar.opened" />
      </el-menu>
    </div>

    <div class="main-container">
      <div class="navbar">
        <div class="hamburger" @click="toggleSidebar">
          <el-icon>
            <Fold v-if="sidebar.opened" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="right-menu">
          <div class="user-profile-container" v-if="userInfo">
            <el-dropdown @command="handleCommand" trigger="click">
              <div class="user-profile">
                <el-avatar :size="32" :src="userAvatar" />
                <span class="username">{{ userInfo.name }}</span>
                <el-icon class="el-icon--right">
                  <ArrowDown />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- <el-dropdown-item command="profile">
                    <el-icon>
                      <User />
                    </el-icon>
                    <span>个人资料</span>
                  </el-dropdown-item> -->
                  <el-dropdown-item command="password">
                    <el-icon>
                      <Lock />
                    </el-icon>
                    <span>修改密码</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon>
                      <SwitchButton />
                    </el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-button v-else type="primary" @click="$router.push('/login')">登录</el-button>
        </div>
      </div>

      <!-- 添加标签导航栏 -->
      <tags-view />

      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>

    <!-- 个人资料对话框 -->
    <el-dialog title="个人资料" v-model="profileDialogVisible" width="500px" destroy-on-close>
      <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px">
        <el-form-item label="头像" prop="avatar">
          <div class="avatar-uploader">
            <el-avatar :size="80" :src="profileForm.avatar" />
            <div class="avatar-actions">
              <el-upload class="avatar-upload" action="#" :auto-upload="false" :show-file-list="false" :on-change="handleAvatarChange">
                <el-button type="primary" size="small">更换头像</el-button>
              </el-upload>
              <div class="avatar-tip">支持 JPG、PNG 格式，不超过 2MB</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="profileForm.mobile" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" v-model="passwordDialogVisible" width="500px" destroy-on-close>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="120px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input v-model="passwordForm.confirm_password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword" :loading="loading">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "../store";
import { useUserStore } from "../store/modules/user";
import { useTagsViewStore } from "../store/modules/tagsView";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { computed, ref, reactive, onMounted } from "vue";
import Cookies from "js-cookie";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import TagsView from "@/components/TagsView.vue";
import SidebarItem from "@/components/SidebarItem.vue";
import { transformRoutes } from "@/utils";
import { updateUserPassword } from "@/api/admin";

import {
  ArrowDown,
  User,
  Lock,
  SwitchButton,
  Fold,
  Expand,
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const tagsViewStore = useTagsViewStore();
const { sidebar } = storeToRefs(appStore);
const { toggleSidebar } = appStore;
const loading = ref(false);
const token = computed(() => Cookies.get("token"));
const userInfo = computed(() => userStore.userInfo);
const cachedViews = computed(() => tagsViewStore.cachedViews);
// 获取路由配置
const routes = computed(() => {
  let { menusList } = userStore || {};
  if (menusList.length == 0) {
    let strMenusList = Cookies.get("menusList") || "[]";
    menusList = JSON.parse(strMenusList);
  }
  menusList = transformRoutes(menusList);
  // 过滤掉不需要显示在菜单中的路由
  let staticPath = router.options.routes.filter((route) => {
    return (
      route.path === "/" ||
      (!route.meta?.hidden &&
        route.path !== "/login" &&
        !route.path.includes("redirect"))
    );
  });
  let list = [...staticPath, ...menusList];
  console.log("页面路由列表", list);
  return list;
});

// 用户头像
const userAvatar = computed(() => {
  return (
    userInfo.value?.avatar ||
    "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
  );
});

// 个人资料对话框
const profileDialogVisible = ref(false);
const profileFormRef = ref<FormInstance>();
const profileForm = reactive({
  name: "",
  mobile: "",
  email: "",
  avatar: "",
});

// 个人资料表单验证规则
const profileRules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  mobile: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号格式",
      trigger: "blur",
    },
  ],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
});

// 修改密码对话框
const passwordDialogVisible = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirm_password: "",
});

// 密码表单验证规则
const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: "请输入当前密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" },
  ],
  confirm_password: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === "logout") {
    userStore.logout();
  } else if (command === "profile") {
    showProfileDialog();
  } else if (command === "password") {
    showPasswordDialog();
  }
};

// 显示个人资料对话框
const showProfileDialog = () => {
  // 填充表单数据
  profileForm.name = userInfo.value?.name || "";
  profileForm.mobile = userInfo.value?.mobile || "";
  profileForm.email = userInfo.value?.email || "";
  profileForm.avatar = userAvatar.value;

  profileDialogVisible.value = true;
};

// 处理头像变更
const handleAvatarChange = (file: any) => {
  // 检查文件类型
  const isImage =
    file.raw.type === "image/jpeg" || file.raw.type === "image/png";
  // 检查文件大小
  const isLt2M = file.raw.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("头像只能是 JPG 或 PNG 格式!");
    return;
  }
  if (!isLt2M) {
    ElMessage.error("头像大小不能超过 2MB!");
    return;
  }

  // 创建一个 FileReader 对象
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = () => {
    // 设置头像预览
    profileForm.avatar = reader.result as string;
  };
};

// 保存个人资料
const saveProfile = async () => {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 更新本地存储的用户信息
        if (userInfo.value) {
          userStore.updateUserInfo({
            ...userInfo.value,
            name: profileForm.name,
            mobile: profileForm.mobile,
            email: profileForm.email,
            avatar: profileForm.avatar,
          });
        }

        ElMessage.success("个人资料更新成功");
        profileDialogVisible.value = false;
      } catch (error) {
        console.error("保存个人资料失败:", error);

        // 模拟成功，更新本地存储的用户信息
        if (userInfo.value) {
          userStore.updateUserInfo({
            ...userInfo.value,
            name: profileForm.name,
            mobile: profileForm.mobile,
            email: profileForm.email,
            avatar: profileForm.avatar,
          });
        }

        ElMessage.success("个人资料更新成功");
        profileDialogVisible.value = false;
      }
    }
  });
};

// 显示修改密码对话框
const showPasswordDialog = () => {
  // 重置表单
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirm_password = "";

  passwordDialogVisible.value = true;
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      const response = await updateUserPassword(passwordForm);
      loading.value = false;
      console.log("response", response);
      if (response.code && response.code == 200) {
        ElMessage.success("密码修改成功，请重新登录");
        userStore.logout();
        passwordDialogVisible.value = false;
      }
    } else {
      ElMessage.error("请填写必要信息");
    }
  });
};

// 在组件挂载时检查登录状态
onMounted(() => {
  // 如果有token但没有用户信息，尝试获取用户信息
  if (token.value && !userInfo.value) {
    userStore.mockLogin();
  }
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  overflow: hidden;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;

  &.is-collapsed {
    width: 64px;
  }

  .logo {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: bold;
    overflow: hidden;
    white-space: nowrap;
  }

  /* 增强菜单项的样式 */
  :deep(.el-menu) {
    border-right: none;

    .el-menu-item {
      height: 50px;
      line-height: 50px;

      &:hover {
        background-color: #263445 !important;
        color: #fff !important;
      }

      &.is-active {
        background-color: #1f2d3d !important;
        color: #409eff !important;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #409eff;
        }
      }

      .el-icon {
        color: inherit;
        font-size: 18px;
        margin-right: 5px;
      }
    }

    /* 修复折叠时子菜单样式 */
    .el-sub-menu {
      &.is-active {
        > .el-sub-menu__title {
          color: #409eff !important;
        }
      }

      .el-sub-menu__title {
        &:hover {
          background-color: #263445 !important;
          color: #fff !important;
        }
      }
    }
  }

  /* 修复折叠时弹出的子菜单样式 */
  :deep(.el-menu--popup) {
    background-color: #1f2d3d !important;

    .el-menu-item {
      background-color: #1f2d3d !important;

      &:hover {
        background-color: #263445 !important;
      }

      &.is-active {
        background-color: #263445 !important;
        color: #409eff !important;
      }
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .navbar {
    height: 50px;
    background: white;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    padding: 0 20px;
    justify-content: space-between;

    .hamburger {
      cursor: pointer;
      font-size: 20px;
      margin-right: 20px;
      color: #606266;

      &:hover {
        color: #409eff;
      }
    }

    .breadcrumb {
      flex: 1;
      padding-left: 0; /* 移除左侧内边距，使面包屑更靠左 */

      :deep(.el-breadcrumb__item) {
        .el-breadcrumb__inner {
          color: #606266;

          &:hover {
            color: #409eff;
          }

          &.is-link {
            font-weight: normal;
          }
        }

        &:last-child {
          .el-breadcrumb__inner {
            color: #97a8be;
          }
        }
      }
    }

    .right-menu {
      display: flex;
      align-items: center;

      .user-profile-container {
        height: 50px;
        display: flex;
        align-items: center;
      }

      .user-profile {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 8px;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        .username {
          margin: 0 8px;
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .app-main {
    flex: 1;
    padding: 20px;
    background: #f0f2f5;
    overflow: auto;
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// 头像上传样式
.avatar-uploader {
  display: flex;
  align-items: center;

  .avatar-actions {
    margin-left: 20px;

    .avatar-tip {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
}

// 下拉菜单样式增强
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;

  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

@media screen and (max-width: 768px) {
  .sidebar-container {
    position: fixed;
    z-index: 1001;
    transform: translateX(-210px);

    &.is-collapsed {
      transform: translateX(0);
      width: 210px;
    }
  }

  .main-container {
    margin-left: 0;
  }

  .navbar {
    .right-menu {
      .user-profile {
        .username {
          display: none;
        }
      }
    }
  }
}
</style>