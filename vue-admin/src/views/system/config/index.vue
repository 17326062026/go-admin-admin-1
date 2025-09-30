<template>
  <div class="role-container">
    <el-card class="role-card">
      <template #header>
        <div class="card-header">
          <span class="title">配置信息</span>
          <div class="header-actions">
            <!-- <el-button type="primary" icon="Plus" @click="handleAdd">添加配置</el-button> -->
            <el-button type="info" icon="Refresh" @click="fetchData">刷新数据</el-button>
          </div>
        </div>
      </template>
      <el-table v-loading="loading" :data="roleList" style="width: 100%" border row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="params_key" label="参数KEY" />
        <el-table-column prop="params_value" label="奖励比例(%)" />
        <el-table-column prop="condition" label="满足条件" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <!-- <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="参数KEY" prop="params_key">
          <el-input v-model="form.params_key" disabled/>
        </el-form-item>
        <el-form-item label="奖励比例" prop="params_value">
          <el-input-number v-model="form.params_value" :min="0.01" :precision="2" :step="0.01" :max="1000000" />
        </el-form-item>
        <el-form-item label="满足条件" prop="condition">
          <el-input-number v-model="form.condition" :min="1" :precision="0" :step="1" :max="10000000" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" />
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
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  getConfigList,
  createConfig,
  updateConfig,
  deleteConfig,
} from "@/api/config";

const roleList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const currentId = ref<number>();

const form = reactive({
  params_key: "",
  params_value: "",
  description: "",
  condition: "",
  
});

const rules = {
  params_key: [{ required: true, message: "请输入参数KEY", trigger: "blur" }],
  params_value: [
    { required: true, message: "请输入奖励比例", trigger: "blur" },
  ],
  condition: [{ required: true, message: "请输入满足条件", trigger: "blur" }],
  description: [{ required: true, message: "请输入描述", trigger: "blur" }],
};

const fetchData = async () => {
  loading.value = true;
  let response:any = await getConfigList({});
  if (response.code == 200) {
    roleList.value = response.data.list || [];
  }
  loading.value = false;
};

const handleAdd = () => {
  dialogTitle.value = "添加配置";
  dialogVisible.value = true;
  currentId.value = undefined;
  Object.assign(form, {
    params_key: "",
    params_value: "",
    description: "",
    condition: "",
  });
};

const handleEdit = (row: any) => {
  dialogTitle.value = "编辑配置";
  console.log("row---", row);
  dialogVisible.value = true;
  currentId.value = row.id;
  Object.assign(form, {
    ...row,
  });
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm("确认删除该配置?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 确保在请求前设置token
        await deleteConfig(row.id);
        ElMessage.success("删除成功");
        fetchData();
      } catch (error) {
        console.error("删除角色失败:", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (currentId.value) {
        await updateConfig(currentId.value, form);
      } else {
        await createConfig(form);
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