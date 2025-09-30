<template>
  <div class="role-container">
    <el-card class="role-card">
      <template #header>

        <el-row style="margin-top: 10px;" class="card-header">
          <el-col :span="4" class="item">
            <span class="title">商品名称: </span>
            <el-input v-model="searchGoodsForm.name" style="width: 65%;margin-left: 10px;" />
          </el-col>
          <el-col :span="4" class="item">
            <span class="title">商品类型: </span>
            <el-select v-model="searchGoodsForm.category_id" placeholder="请选择商品分类" class="input" style="width: 65%;margin-left: 10px;">
              <el-option v-for="item in goodsCategoryList" :key="item.id" :label="item.category_name" :value="item.id" />
            </el-select>
          </el-col>
          <el-col :span="4" class="item">
            <span class="title">商品分类: </span>
            <el-select v-model="searchGoodsForm.type" placeholder="请选择订单类型" class="input" style="width: 65%;margin-left: 10px;">
              <el-option v-for="item in orderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="12">
            <div class="header-actions" style="display: flex;justify-content: flex-end;">
              <el-button type="primary" icon="Search" @click="queryGoodsData">查询</el-button>
              <el-button type="info" icon="Refresh" @click="refreshData">重置</el-button>
              <el-button type="primary" icon="Plus" @click="handleAdd">添加商品</el-button>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="goodsList" style="width: 100%" border row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="goods_images" label="商品照片">
          <template #default="{ row }">
            <span>
              <img :src="row.goods_images" alt="" style="width: 100px;">
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column prop="purchasing_cost_price" label="成本价/采购价" />
        <el-table-column prop="manufacturer" label="采购厂家" v-if="searchGoodsForm.type=='2'" />
        <el-table-column prop="shipping_cost_price" label="(合众)进货价格" />
        <el-table-column prop="joint_venture_purchasing_price" label="(联营)进货价格" />
        <el-table-column prop="ordinary_users_price" label="(意向)进货价格" />
        <el-table-column prop="student_price" label="(学员)进货价格" />
        <el-table-column prop="type" label="商品类型">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.type==1">出货商品</el-tag>
            <el-tag type="danger" v-else-if="row.type==2">采购商品</el-tag>
            <el-tag type="info" v-else>---</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top: 10px;" background layout="total, prev, pager, next, jumper" :total="total" v-model:current-page="currentPage" @current-change="handleCurrentChange" />
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="40%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="145px" onsubmit="return false">

        <el-form-item label="商品类型" prop="name">
          <el-radio-group v-model="form.type" size="large">
            <el-radio-button label="出货商品" :value="1" />
            <el-radio-button label="采购商品" :value="2" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品大分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 240px">
            <el-option v-for="item in goodsCategoryList" :key="item.id" :label="item.category_name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="1" :max="10000000" />
        </el-form-item>
        <div v-if="form.type==2">
          <el-form-item label="采购价" prop="purchasing_cost_price">
            <el-input-number v-model="form.purchasing_cost_price" :min="1" :precision="2" :step="0.1" :max="1000000" />
          </el-form-item>
          <el-form-item label="采购厂家" prop="manufacturer">
            <el-input v-model="form.manufacturer" />
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item label="成本价" prop="purchasing_cost_price">
            <el-input-number v-model="form.purchasing_cost_price" :min="1" :precision="2" :step="0.1" :max="1000000" />
          </el-form-item>
          <el-form-item label="(合众)进货价格" prop="shipping_cost_price">
            <el-input-number v-model="form.shipping_cost_price" :min="1" :precision="2" :step="0.1" :max="1000000" />
          </el-form-item>
          <el-form-item label="(联营)进货价格" prop="joint_venture_purchasing_price">
            <el-input-number v-model="form.joint_venture_purchasing_price" :min="1" :precision="2" :step="0.1" :max="1000000" />
          </el-form-item>
          <el-form-item label="(意向)进货价格" prop="ordinary_users_price">
            <el-input-number v-model="form.ordinary_users_price" :min="1" :precision="2" :step="0.1" :max="1000000" />
          </el-form-item>
          <el-form-item label="(学员)进货价格" prop="student_price">
            <el-input-number v-model="form.student_price" :min="1" :precision="2" :step="0.1" :max="1000000" />
          </el-form-item>

        </div>
        <el-form-item label="商品照片" prop="goods_images">
          <el-upload :limit="1" style="position: relative;" action="" :before-upload="beforeUploadAction" :on-remove="handleRemove" list-type="picture-card" :file-list="fileList">
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品详情" prop="content">
          <wang-edior v-model="form.content" />
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
import WangEdior from "@/components/WangEdior/index.vue";
import { ref, reactive, onMounted, onActivated } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import type { UploadProps } from "element-plus";
import {
  getGoodsList,
  createGoods,
  updateGoods,
  deleteGoods,
  uploadFile,
} from "@/api/goods";
import { getGoodsCategoryList } from "@/api/goodsCategory";
import Cookies from "js-cookie";
const goodsList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const currentId = ref<number>();
const total = ref(0);
const currentPage = ref(1);
let form = reactive({
  id: "",
  name: "",
  manufacturer: "",
  purchasing_cost_price: "",
  shipping_cost_price: "",
  joint_venture_purchasing_price: "",
  ordinary_users_price: "",
  student_price: "",
  stock: 0,
  goods_images: "",
  content: "",
  type: 1,
  category_id: 0,
});
const orderTypeOptions = ref([
  { value: "1", label: "出货商品" },
  { value: "2", label: "采购商品" },
]);
const rules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  content: [{ required: true, message: "请输入商品详情", trigger: "blur" }],
  stock: [{ required: true, message: "请输入商品库存", trigger: "blur" }],
  category_id: [{ required: true, message: "请选择商品分类", trigger: "blur" }],
  purchasing_cost_price: [
    { required: true, message: "请输入商品成本价", trigger: "blur" },
  ],
  shipping_cost_price: [
    { required: true, message: "请输入商品(合众)进货价", trigger: "blur" },
  ],
  joint_venture_purchasing_price: [
    { required: true, message: "请输入商品(联营)进货价", trigger: "blur" },
  ],
  ordinary_users_price: [
    { required: true, message: "请输入商品(意向)进货价", trigger: "blur" },
  ],
  student_price: [
    { required: true, message: "请输入商品(学员)进货价", trigger: "blur" },
  ],
};
const imageUrl = ref("");
const goodsCategoryList = ref([{ id: "", category_name: "" }]);
//上传之后的操作
let fileList = ref([]);
let uploading = ref(false);
const beforeUploadAction = (file: any, fileLi: any) => {
  return new Promise((resolve, reject) => {
    uploading.value = true;
    const formData = new FormData();
    console.log("file", file);
    formData.append("file", file);
    uploadFile(formData).then((urlInfo: any) => {
      if (urlInfo.code == 200) {
        form.goods_images = urlInfo.data;
        //emit("update", urlInfo.data);
      }
      //resolve(urlInfo);
    });
  });
};
const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log(uploadFile.url, "uploadFile");
  console.log(uploadFiles, "uploadFiles");
  console.log(fileList, "fileList-start");
  // fileList.value = uploadFiles.filter((item) => item.uid !== uploadFile.uid);
  console.log(fileList, "fileList-end");
};
const handleAvatarSuccess = (response: any, uploadFile: any) => {};

const beforeAvatarUpload = (rawFile: any) => {
  if (rawFile.type !== "image/jpeg") {
    ElMessage.error("Avatar picture must be JPG format!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  console.log(`current page: ${val}`);
  fetchData();
};
const searchGoodsForm = reactive({
  name: "",
  type: "1",
  category_id: undefined,
});
const fetchData = async () => {
  loading.value = true;
  let params = { page: currentPage.value, ...searchGoodsForm };
  console.log("params", params);
  let response: any = await getGoodsList(params);
  if (response.code == 200) {
    goodsList.value = response.data.list || [];
    total.value = response.data.total;
  }
  loading.value = false;
};
const queryGoodsData = async () => {
  currentPage.value = 1;
  fetchData();
};
const refreshData = async () => {
  currentPage.value = 1;
  searchGoodsForm.name = "";
  searchGoodsForm.type = "1";
  searchGoodsForm.category_id = undefined;
  fetchData();
};

const handleAdd = () => {
  dialogTitle.value = "添加商品";
  dialogVisible.value = true;
  currentId.value = undefined;
  formRef.value?.resetFields(); // 安全调用
  fileList.value = [];
};

const handleEdit = (row: any) => {
  dialogTitle.value = "编辑商品";
  console.log("row---", row);
  dialogVisible.value = true;
  currentId.value = row.id;
  form.id = row.id;
  form.content = row.content;
  form.manufacturer = row.manufacturer;
  form.name = row.name;
  form.type = row.type;
  form.stock = row.stock;
  form.purchasing_cost_price = row.purchasing_cost_price;
  form.shipping_cost_price = row.shipping_cost_price;
  form.joint_venture_purchasing_price = row.joint_venture_purchasing_price;
  form.ordinary_users_price = row.ordinary_users_price;
  form.student_price = row.student_price;
  form.goods_images = row.goods_images;
  form.category_id = row.category_id;
  fileList.value = [
    {
      name: row.goods_images,
      url: row.goods_images,
    },
  ];
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm("确认删除该条记录?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 确保在请求前设置token
      await deleteGoods(row.id);
      fetchData();
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    console.log("验证结果--->>", valid);
    if (valid) {
      if (form.id) {
        await updateGoods(form.id, form);
      } else {
        await createGoods(form);
      }
      ElMessage.success("保存成功");
      dialogVisible.value = false;
      fetchData();
    } else {
      ElMessage.error("验证失败,请填写必要项");
    }
  });
};
//获取所有角色
const getGoodsCategoryListData = async () => {
  loading.value = true;
  let response: any = await getGoodsCategoryList({ isAll: 1, limit: 1000 });
  if (response.code == 200) {
    goodsCategoryList.value = response.data.list || [];
  }
  loading.value = false;
};
onMounted(() => {
  fetchData();
  getGoodsCategoryListData();
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