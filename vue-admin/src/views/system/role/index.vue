<template>
  <div class="role-container">
    <el-card class="role-card">
      <template #header>
        <div class="card-header">
          <span class="title">角色列表</span>
          <div class="header-actions">
            <!-- <el-button type="primary" icon="Plus" @click="handleAdd">添加角色</el-button> -->
            <el-button type="info" icon="Refresh" @click="fetchData">刷新数据</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="roleList" style="width: 100%" border row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="role_name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <!-- <el-button type="danger" size="small" @click="handleDelete(row)" v-if="row.id!=1">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="form.role_name" disabled />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-tree ref="treeRef" :data="menuList" show-checkbox node-key="id" :checkStrictly="true" :props="{ label: 'menu_name'  }" v-model:checked-keys="form.permissions" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { getRoleList, createRole, updateRole } from "@/api/role";
import { getMenuList } from "@/api/menu";
const treeRef = ref();
const roleList = ref([]);
const menuList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const currentId = ref<number>();

const form = reactive({
  role_name: "",
  description: "",
  permissions: [] as number[],
});

const rules = {
  role_name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入描述", trigger: "blur" }],
};

const fetchData = async () => {
  loading.value = true;
  let response: any = await getRoleList({});
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

  let menuResponse: any = await getMenuList();
  if (menuResponse.code == 200) {
    menuList.value = menuResponse.data || [];
  }
  console.log("菜单列表", menuResponse);
};

const handleAdd = () => {
  dialogTitle.value = "添加角色";
  dialogVisible.value = true;
  currentId.value = undefined;
  Object.assign(form, {
    role_name: "",
    description: "",
    permissions: [],
  });
};

const handleEdit = (row: any) => {
  dialogTitle.value = "编辑角色";
  console.log("row---", row);
  dialogVisible.value = true;
  currentId.value = row.id;
  Object.assign(form, {
    role_name: row.role_name,
    description: row.description,
    permissions: row.permissions || [],
  });
  setTimeout(() => {
    treeRef.value.setCheckedKeys(row.permissions);
  }, 0);
};

// const handleDelete = (row: any) => {
//   ElMessageBox.confirm("确认删除该角色?", "警告", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning",
//   })
//     .then(async () => {
//       try {
//         // 确保在请求前设置token
//         await deleteRole(row.id);
//         ElMessage.success("删除成功");
//         fetchData();
//       } catch (error) {
//         console.error("删除角色失败:", error);
//         ElMessage.error("删除失败");

//         // 如果API请求失败，模拟删除成功
//         roleList.value = roleList.value.filter((item:any) => item.id !== row.id);
//       }
//     })
//     .catch(() => {
//       // 用户取消删除操作
//     });
// };

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    let permissions = treeRef.value?.getCheckedKeys();
    if (permissions.length == 0) {
      ElMessage.error("请选择角色的权限");
      return;
    }
    if (valid) {
      form.permissions = permissions;
      if (currentId.value) {
        await updateRole(currentId.value, form);
      } else {
        await createRole(form);
      }
      ElMessage.success("保存成功");
      dialogVisible.value = false;
      fetchData();
    }
  });
};

onMounted(() => {
  fetchData();
});

onActivated(() => {
  // 确保在组件激活时设置token

  fetchData();
});
</script>

<style lang="scss" scoped>
.role-container {
  padding: 20px;

  .role-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .role-container {
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
</style>