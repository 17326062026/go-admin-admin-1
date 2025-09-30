<template>
  <div class="role-container">
    <el-card class="role-card">
      <template #header>
        <div class="card-header">
          <span class="title">商品分类列表</span>
          <div class="header-actions">
            <el-button type="primary" icon="Plus" @click="handleAdd">添加商品分类</el-button>
            <el-button type="info" icon="Refresh" @click="fetchData">刷新数据</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableList" style="width: 100%" border row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="category_name" label="商品分类名称" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品分类名称" prop="role_name">
          <el-input v-model="form.category_name" />
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
import { ref, reactive, onMounted } from "vue";
import { ElMessage,ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { getGoodsCategoryList, createGoodsCategory, updateGoodsCategory,deleteGoodsCategory } from "@/api/goodsCategory";
const tableList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const currentId = ref<number>();

const form = reactive({
  category_name: "",
});

const rules = {
  category_name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
};

const fetchData = async () => {
  loading.value = true;
  let response: any = await getGoodsCategoryList({});
  if (response.code == 200) {
    tableList.value = response.data.list || [];
  }
  loading.value = false;
};

const handleAdd = () => {
  dialogTitle.value = "添加商品分类";
  dialogVisible.value = true;
  currentId.value = undefined;
  Object.assign(form, {
    category_name: "",
  });
};

const handleEdit = (row: any) => {
  dialogTitle.value = "编辑商品分类";
  console.log("row---", row);
  dialogVisible.value = true;
  currentId.value = row.id;
  Object.assign(form, {
    category_name: row.category_name,
  });
};



const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (currentId.value) {
        await updateGoodsCategory(currentId.value, form);
      } else {
        await createGoodsCategory(form);
      }
      ElMessage.success("保存成功");
      dialogVisible.value = false;
      fetchData();
    }
  });
};
const handleDelete = (row: any) => {
  ElMessageBox.confirm("确认删除该分类?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 确保在请求前设置token
        await deleteGoodsCategory(row.id);
        ElMessage.success("删除成功");
        fetchData();
      } catch (error) {
        ElMessage.error("删除失败");

      }
    })
    .catch(() => {
      // 用户取消删除操作
    });
};
onMounted(() => {
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