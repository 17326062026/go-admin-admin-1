<template>
  <div class="admin-container">
    <el-card class="admin-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="title">管理员列表/用户列表</span>
            <el-tag type="success">共 {{ total }} 条数据</el-tag>
            <span class="role-item">超级管理员: {{roleCountInfo.role_1}}人</span>
            <span class="role-item">联营:{{roleCountInfo.role_2}}人</span>
            <span class="role-item">合众:{{roleCountInfo.role_3}}人</span>
          </div>
          <div class="header-actions">
            <div class="search-box">
              <span>用户手机号:<el-input v-model="searchform.mobile" style="width:160px;" /></span>
              <span>用户姓名:<el-input v-model="searchform.name" style="width:160px;" /></span>
              <span style="margin-left: 10px;">
                <el-button type="primary" icon="Search" @click="queryData">查询</el-button>
                <el-button type="info" icon="Refresh" @click="refreshData">重置</el-button>
              </span>
            </div>
            <el-button type="primary" icon="Plus" @click="handleAdd">添加管理员</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="adminList" style="width: 100%" border row-key="id" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="headimgurl" label="用户头像">
          <template #default="{ row }">
            <span>
              <img :src="row.headimgurl" alt="" style="width: 100px;">
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="mobile" label="手机号" />
        <el-table-column prop="role_id" label="角色">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.role_id==1">{{row.role_name}}</el-tag>
            <el-tag type="danger" v-else-if="row.role_id==2">{{row.role_name}}</el-tag>
            <el-tag type="primary" v-else-if="row.role_id==3">{{row.role_name}}</el-tag>
            <el-tag type="warning" v-else-if="row.role_id==4">{{row.role_name}}</el-tag>
            <el-tag type="info" v-else>{{row.role_name}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_offline_status" label="下线审核状态">
          <template #default="{ row }">
            <div class="apply-user" v-if="row.parent_id">
              <span>
                <el-tag type="success" v-if="row.user_offline_status==1">通过</el-tag>
                <el-tag type="danger" v-else-if="row.user_offline_status==0">未审核</el-tag>
              </span>
              <el-button type="primary" size="small" v-if="row.user_offline_status==0" @click="examineUser(row)">审核</el-button>
            </div>
            <div v-else> </div>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="上级姓名">
          <template #default="{ row }">
            <span class="parent-box">
              <span>ID: {{row.parent_id || ''}}</span>
              <span>姓名: {{row.parent_info ?row.parent_info.name: ''}}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" />
        <!-- <el-table-column prop="updated_at" label="更新时间" /> -->
        <el-table-column prop="openid" label="微信唯一标识" />
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)" v-if="row.id!=1">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination v-if="total > 0" :current-page="currentPage" :page-size="pageSize" layout="total, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input type="password" v-model="form.confirm_password" />
        </el-form-item>

        <el-form-item label="角色" prop="role_id">
          <el-select v-model="form.role_id" placeholder="请选择角色" style="width: 240px">
            <el-option v-for="item in roleList" :key="item.id" :label="item.role_name" :value="item.id" />
          </el-select>
          <small><span style="color:red">*</span>如果将含有微信标识的用户设置为超级管理员时,手机端将可以添加出货订单</small>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    <!-- 展示用户下线团队 -->
    <el-dialog title="组织架构图" v-model="dialogUserLineVisible" width="75%" top="5%">
      <HierarchyChart :data="orgData" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import HierarchyChart from "./HierarchyChart.vue";
import { ref, reactive, onMounted, onActivated } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateUserRole,
  getUserChildren,
  examineUserStatus,
  getDashboard,
} from "@/api/admin";
import { getRoleList } from "@/api/role";
// 数据状态
const roleList = ref([{ id: "", role_name: "" }]);
const adminList = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框状态
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const currentId = ref<number>();
const dialogUserLineVisible = ref(false);

// 表单数据
const form = reactive({
  name: "",
  mobile: "",
  password: "",
  confirm_password: "",
  role_id: "1",
  id: "",
});
const searchform = reactive({
  mobile: "",
  name: "",
});
// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  mobile: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号格式",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" },
  ],
  confirm_password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" },
  ],
  role_id: [{ required: true, message: "请选择角色", trigger: "blur" }],
};

// 获取管理员列表数据
const fetchData = async () => {
  loading.value = true;
  const response: any = await getAdminList({
    ...searchform,
    page: currentPage.value,
  });
  loading.value = false;
  if (response.data && Array.isArray(response.data.list)) {
    adminList.value = response.data.list || [];
    total.value = response.data.total;
  }
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchData();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchData();
};

// 添加管理员
const handleAdd = () => {
  dialogTitle.value = "添加管理员";
  dialogVisible.value = true;
  currentId.value = undefined;
  Object.assign(form, {
    name: "",
    mobile: "",
    password: "",
    role_id: 1,
  });
};

// 编辑管理员
const handleEdit = (row: any) => {
  dialogTitle.value = "编辑管理员";
  dialogVisible.value = true;
  currentId.value = row.id;
  Object.assign(form, {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    role_id: row.role_id,
  });
};

// 删除管理员
const handleDelete = (row: any) => {
  ElMessageBox.confirm("确认删除该用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteAdmin(row.id);
      ElMessage.success("删除成功");
      fetchData();
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

const handleUpdateUserRole = (row: any) => {
  ElMessageBox.confirm("确认要升级该用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await updateUserRole(row);
      ElMessage.success("成功");
      fetchData();
    })
    .catch(() => {
      // 用户取消删除操作
    });
};
const examineUser = async (row: any) => {
  ElMessageBox.confirm("确认审核通过该下线吗?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let response: any = await examineUserStatus(row);
      if (response.code == 200) {
        fetchData();
      }
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (currentId.value) {
        // 更新管理员
        const { password, ...updateData } = form;
        const response: any = await updateAdmin(currentId.value, form);
        if (response.code == 200) {
          ElMessage.success("更新成功");
        }
      } else {
        // 创建管理员
        const response: any = await createAdmin(form);
        if (response.code == 200) {
          ElMessage.success("添加成功");
        }
      }
      dialogVisible.value = false;
      fetchData();
    }
  });
};
const orgData = ref({
  name: "CEO",
  children: [
    {
      name: "技术部",
      children: [{ name: "前端组" }, { name: "后端组" }, { name: "测试组" }],
    },
    {
      name: "市场部",
      children: [{ name: "推广组" }, { name: "销售组" }],
    },
    {
      name: "人事部",
      children: [{ name: "招聘组" }, { name: "培训组" }],
    },
  ],
});
const lookUserGroup = async (row: any) => {
  const response: any = await getUserChildren({ user_id: row.id });
  if (response.code == 200) {
    if (response.data.length == 0) {
      ElMessage.error("暂无下线");
    } else {
      orgData.value = response.data[0];
      dialogUserLineVisible.value = true;
    }
  }
};
// 组件挂载时获取数据
onMounted(() => {
  fetchData();
  getRoleListData();
  getDashboardInfo();
});

// 当组件被缓存后激活时也重新获取数据
onActivated(() => {
  fetchData();
});
const refreshData = () => {
  currentPage.value = 1;
  searchform.mobile = "";
  searchform.name = "";
  fetchData();
};
const queryData = () => {
  currentPage.value = 1;
  fetchData();
};
const roleCountInfo = reactive({
  role_1: 0,
  role_2: 0,
  role_3: 0,
});

const getDashboardInfo = async () => {
  let response: any = await getDashboard({});
  if (response.code == 200) {
    roleCountInfo.role_1 = response.data.role_1;
    roleCountInfo.role_2 = response.data.role_2;
    roleCountInfo.role_3 = response.data.role_3;
  }
  loading.value = false;
};
//获取所有角色
const getRoleListData = async () => {
  loading.value = true;
  let response: any = await getRoleList({ limit: 1000 });
  if (response.code == 200) {
    roleList.value = (response.data.list || []).map((item: any) => {
      let { permissions } = item;
      const menuIds = permissions.map((permission: any) => permission.menu_id);
      return {
        ...item,
        permissions: menuIds,
      };
    });
  }
  loading.value = false;
};
</script>

<style lang="scss" scoped>
.apply-user {
  min-width: 100px;
  display: flex;
  justify-content: space-between;
}
.admin-container {
  padding: 20px;

  .admin-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
.search-box {
  span {
    margin-left: 10px;
  }
}
.parent-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
@media screen and (max-width: 768px) {
  .admin-container {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .header-actions {
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
.role-item{
  margin-left: 10px;
}
</style>