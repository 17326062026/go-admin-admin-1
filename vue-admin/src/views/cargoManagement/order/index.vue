<template>
  <div class="role-container">
    <el-card class="role-card">
      <template #header>
        <el-row class="card-header">
          <el-col :span="6" class="item">
            <span class="title">商品名称:</span>
            <el-input v-model="searchform.goods_name" class="input" />
          </el-col>
          <el-col :span="6" class="item">
            <span class="title">用户姓名:</span>
            <el-input v-model="searchform.user_name" class="input" />
          </el-col>
          <el-col :span="6" class="item">
            <span class="title">用户手机号:</span>
            <el-input v-model="searchform.mobile" class="input" />
          </el-col>
          <el-col :span="6" class="item">
            <span class="title">创建日期: </span>
            <el-date-picker v-model="searchform.date" type="daterange" value-format="YYYY-MM-DD" placeholder="请选择创建日期" class="input" />
          </el-col>

        </el-row>
        <el-row style="margin-top: 10px;" class="card-header">
          <el-col :span="6" class="item">
            <span class="title">发货状态: </span>
            <el-select v-model="searchform.shipment_status" placeholder="请选择发货状态" class="input">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="6" class="item">
            <span class="title">订单类型: </span>
            <el-select v-model="searchform.order_type" placeholder="请选择订单类型" class="input">
              <el-option v-for="item in orderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
          <el-col :span="6" class="item">
            <span class="title">商品分类: </span>
            <el-select v-model="searchform.category_id" placeholder="请选择商品分类" class="input" style="width: 65%;margin-left: 10px;">
              <el-option v-for="item in goodsCategoryList" :key="item.id" :label="item.category_name" :value="item.id" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <div class="header-actions" style="display: flex;justify-content: flex-end;">
              <el-button type="primary" icon="Search" @click="queryData">查询</el-button>
              <el-button type="info" icon="Refresh" @click="refreshData">重置</el-button>
              <el-button type="primary" icon="Plus" @click="handleAdd" v-if="userStore.role_id==1">添加出货记录</el-button>
            </div>
          </el-col>
        </el-row>

      </template>
      <el-table v-loading="loading" :data="tableList" style="width: 100%" border row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户信息">
          <template #default="{ row }">
            <span class="user-list">
              <div class="user-item">
                <span class="title">ID:</span><span>{{row.user_id}}</span>
              </div>
              <div class="user-item">
                <span class="title">昵称:</span><span>{{row.user_name}}</span>
              </div>
              <div class="user-item">
                <span class="title">角色:</span><span>
                  <el-tag type="success" v-if="row.role_id==1">超级管理员</el-tag>
                  <el-tag type="danger" v-else-if="row.role_id==2">联营</el-tag>
                  <el-tag type="primary" v-else-if="row.role_id==3">合众</el-tag>
                  <el-tag type="warning" v-else-if="row.role_id==4">意向</el-tag>
                  <el-tag type="info" v-else>--</el-tag>
                </span>
              </div>
              <div class="user-item">
                <span class="title">手机号:</span><span>{{row.user && row.user.mobile ? row.user.mobile : ""}}</span>
              </div>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="订单类型">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.order_type==1">出货订单</el-tag>
            <el-tag type="danger" v-else-if="row.order_type==2">采购订单</el-tag>
            <el-tag type="info" v-else>---</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_money" label="订单总价" v-if="userStore.role_id==1" />
        <el-table-column prop="goods_count" label="总数量" />
        <el-table-column prop="goods_images" label="商品列表">
          <template #default="{ row }">
            <span>
              <el-popover placement="right" :width="520" trigger="click">
                <template #reference>
                  <el-button style="margin-right: 16px" type="info" icon="ShoppingBag">商品详情列表</el-button>
                </template>
                <el-table :data="row.goods_list">
                  <el-table-column width="180" property="name" label="商品名称" />
                  <el-table-column width="150" property="date" label="商品照片">
                    <template #default="{ row }">
                      <img :src="row.goods_images" alt="" style="width: 100px;">
                    </template>
                  </el-table-column>
                  <el-table-column width="150" property="number" label="购买数量" />
                </el-table>
              </el-popover>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建日期" />
        <el-table-column prop="shipment_status" label="发货状态">

          <template #default="{ row }">
            <el-tag type="success" v-if="row.shipment_status">已发货</el-tag>
            <el-tag type="primary" v-else>未发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="role_id" label="下单时用户角色">
          <template #default="{ row }">
            <el-tag type="success" v-if="row.role_id==1">超级管理员</el-tag>
            <el-tag type="danger" v-else-if="row.role_id==2">联营</el-tag>
            <el-tag type="primary" v-else-if="row.role_id==3">合众</el-tag>
            <el-tag type="info" v-else-if="row.role_id==4">意向</el-tag>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" v-if="row.shipment_status==0" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" v-if="row.shipment_status==0" @click="handleDelete(row)">删除</el-button>
            <el-button type="warning" size="small" v-if="row.shipment_status==0" @click="deliverOrder(row)">发货</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top: 10px;" background layout="total, prev, pager, next, jumper" :total="total" v-model:current-page="currentPage" @current-change="handleCurrentChange" />
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px" class="order-content">
        <el-form-item label="订单类型" prop="order_type">
          <el-radio-group v-model="form.order_type" size="large" @change="orderTypeChange">
            <el-radio-button label="出货订单" :value="1" />
            <el-radio-button label="采购订单" :value="2" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择用户:" prop="user_id">
          <el-input v-model="form.user_name" style="width: 60%;" disabled />
          <el-button type="primary" style="margin-left: 15px;" @click="openUserDialog">选择进货人</el-button>
        </el-form-item>
        <div v-for="(item,index) in form.goods_list" :key="index" class="goods-item">

          <el-button type="primary" icon="Plus" class="goods-add" v-if="index==0" @click="addGoods">添加</el-button>
          <el-button type="danger" icon="Delete" class="goods-add" v-else @click="removeGoods(index)">移除</el-button>
          <el-row>
            <el-col :span="24">
              <el-form-item label="选择商品:">
                <el-input v-model="item.goods_name" style="width: 60%;" disabled />
                <el-button type="primary" style="margin-left: 15px;" @click="openGoodsDialog(index)">选择商品</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="(合众)进货价格:" v-if="form.role_id==3">
                <el-input-number v-model="item.purchasing_price" :min="1" :precision="2" :step="0.1" :max="1000000" disabled />
              </el-form-item>
              <el-form-item label="(联营)出货价格:" v-else-if="form.role_id==2">
                <el-input-number v-model="item.joint_venture_purchasing_price" :min="1" :precision="2" :step="0.1" :max="1000000" disabled />
              </el-form-item>
              <el-form-item label="(意向)出货价格:" v-else-if="form.role_id==4">
                <el-input-number v-model="item.ordinary_users_price" :min="1" :precision="2" :step="0.1" :max="1000000" disabled />
              </el-form-item>
              <el-form-item label="(学员)出货价格:" v-else-if="form.role_id==6">
                <el-input-number v-model="item.student_price" :min="1" :precision="2" :step="0.1" :max="1000000" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出货数量:" prop="number">
                <el-input-number v-model="item.number" :min="1" :max="10000000" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-form-item label="出货总价:" prop="total_money">
          <span>￥{{total_money}}</span>
        </el-form-item>
        <el-form-item label="订单时间:" prop="created_at">
          <el-date-picker v-model="form.created_at" type="datetime" placeholder="请输入订单时间" value-format="YYYY-MM-DD HH:mm:ss" />
          <small><span style="color: red;"> *</span>没有填写时,按照现在时间</small>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    <!-- 商品选择 -->
    <el-dialog title="选择商品" v-model="goodsDialogVisible" width="50%">
      <div class="search-box">
        <span>商品名称:<el-input v-model="searchGoodsForm.name" style="width: 260px;" /></span>
        <span><el-button type="primary" icon="Search" @click="queryGoodsData">查询</el-button></span>
      </div>
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
        <el-table-column prop="purchasing_cost_price" label="成本价" />
        <el-table-column prop="shipping_cost_price" label="(合众)进货价格" />
        <el-table-column prop="joint_venture_purchasing_price" label="(联营)进货价格" />
        <el-table-column prop="student_price" label="(学员)进货价格" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="selectGoods(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top: 10px;" background layout="total, prev, pager, next, jumper" :total="goodsTotal" v-model:current-page="goodsCurrentPage" @current-change="goodsCurrentChange" />

    </el-dialog>

    <!-- 合作伙伴选择 -->
    <el-dialog :title="dialogUserTitle" v-model="userDialogVisible" width="50%">
      <div class="search-box">
        <span>用户姓名:<el-input v-model="searchUserForm.name" style="width: 260px;" /></span>
        <span>手机号:<el-input v-model="searchUserForm.mobile" style="width: 260px;" /></span>
        <span><el-button type="primary" icon="Search" @click="queryUserData">查询</el-button></span>
      </div>
      <el-table v-loading="loading" :data="userList" style="width: 100%" border row-key="id" stripe>
        <el-table-column prop="id" label="ID" width="80" />
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
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="selectUser(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top: 10px;" background layout="total, prev, pager, next, jumper" :total="userTotal" v-model:current-page="userCurrentPage" @current-change="userCurrentChange" />
    </el-dialog>

    <!-- 发货 -->
    <el-dialog title="发货填写物流" v-model="dialogFormVisible" width="35%">
      <el-form ref="formRef" :model="logistics_list" label-width="100px">

        <div v-for="(item,index) in logistics_list" :key="index" class="item-logistics">
          <el-form-item label="物流公司:">
            <el-select v-model="item.logistics_company_code" placeholder="请选择" style="width:100%">
              <el-option v-for="item in logistics_company_code_options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="物流号:">
            <el-input v-model="item.logistics_number"></el-input>
            <small style="color:red">*请选择正确的物流公司，以免查询物流信息异常</small>
          </el-form-item>
          <div class="btn-remove" v-if="index">
            <el-button :icon="Delete" type="danger" @click="logisticsFormRemove(index)">移除</el-button>
          </div>
        </div>

      </el-form>
      <template #footer>
        <el-button :icon="Plus" type="warning" @click="logisticsFormAdd">增加物流</el-button>
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="logisticsFormSubmit">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { Plus, Delete } from "@element-plus/icons-vue";
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { getGoodsCategoryList } from "@/api/goodsCategory";
import {
  getOrderRecordList,
  createOrderRecord,
  updateOrderRecord,
  deleteOrderRecord,
  deliverOrderApi,
} from "@/api/order_record";
import { getGoodsList } from "@/api/goods";
import { getAdminList } from "@/api/admin";
import { id } from "element-plus/es/locales.mjs";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
console.log("userStore--role_id", userStore.role_id);
const treeRef = ref();
const tableList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogUserTitle = ref("");

const formRef = ref<FormInstance>();
const currentId = ref<number>();
const total = ref(0);
const currentPage = ref(1);
const searchform = reactive({
  goods_name: "",
  user_name: "",
  mobile: "",
  date: [],
  shipment_status: "",
  order_type: "1",
  category_id: "",
});
const form = reactive({
  id: "",
  goods_id: "",
  goods_name: "",
  user_id: "",
  user_name: "",
  purchasing_price: 0,
  joint_venture_purchasing_price: 0,
  type: 2,
  number: 0,
  total_money: "",
  shipment_status: 0,
  logistics_company: "",
  logistics_umber: "",
  role_id: 0,
  order_type: 1,
  created_at: "",
  goods_list: [
    {
      goods_id: 0,
      number: 0,
      goods_name: "",
      purchasing_price: 0,
      joint_venture_purchasing_price: 0,
      ordinary_users_price: 0,
      purchasing_cost_price: 0,
      student_price: 0,
    },
  ],
});
const options = ref([
  { value: "1", label: "已发货" },
  { value: "0", label: "未发货" },
]);

const orderTypeOptions = ref([
  { value: "1", label: "出货订单" },
  { value: "2", label: "采购订单" },
]);

const total_money = computed(() => {
  const { role_id, goods_list = [], order_type = 1 } = form || {};
  let total = 0;
  goods_list.forEach((item) => {
    const {
      joint_venture_purchasing_price,
      number,
      purchasing_price,
      ordinary_users_price,
      purchasing_cost_price,
      student_price,
    } = item;
    if (role_id == 1 || order_type == 2) {
      total = total + number * purchasing_cost_price;
    }
    if (role_id == 2) {
      total = total + number * joint_venture_purchasing_price;
    }
    if (role_id == 3) {
      total = total + number * purchasing_price;
    }
    if (role_id == 4) {
      total = total + number * ordinary_users_price;
    }
    if (role_id == 6) {
      total = total + number * student_price;
    }
  });
  total = total ? Math.round(total * 100) / 100 : 0;
  return total;
});
const rules = {
  goods_id: [{ required: true, message: "请选择商品", trigger: "blur" }],
  user_id: [{ required: true, message: "请选择合作伙伴", trigger: "blur" }],
  number: [{ required: true, message: "请填写出货数量", trigger: "blur" }],
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  console.log(`current page: ${val}`);
  fetchData();
};
const fetchData = async () => {
  loading.value = true;
  let start_date = "",
    end_date = "";
  console.log("searchform", searchform);
  if (searchform.date && Array.isArray(searchform.date)) {
    start_date = searchform.date[0];
    end_date = searchform.date[1];
  }
  let params = {
    page: currentPage.value,
    ...searchform,
    start_date,
    end_date,
  };

  let response: any = await getOrderRecordList(params);
  loading.value = false;
  if (response.code == 200) {
    tableList.value = (response.data.list || []).map((item: any) => {
      let { goods_list } = item;
      let goods_count = 0;
      goods_list.forEach((item) => {
        goods_count = goods_count + item.number;
        item.name = item.goods_info.name;
        item.goods_images = item.goods_info.goods_images;
        item.goods_name = item.goods_info.name;
        item.purchasing_price = item.unit_price;
        item.joint_venture_purchasing_price = item.unit_price;
        item.purchasing_cost_price = item.unit_price;
        item.student_price = item.unit_price;
      });
      return {
        ...item,
        goods_count,
        user_name: item.user ? item.user.name : "",
      };
    });
    total.value = response.data.total;
  }
};

const refreshData = () => {
  currentPage.value = 1;
  searchform.goods_name = "";
  searchform.user_name = "";
  searchform.mobile = "";
  searchform.shipment_status = "";
  searchform.date = "";
  fetchData();
};
const queryData = () => {
  currentPage.value = 1;
  fetchData();
};
const orderTypeChange = () => {
  const { order_type } = form;
  dialogTitle.value = order_type == 1 ? "添加进货订单" : "添加采购订单";
};

const handleAdd = () => {
  dialogTitle.value = "添加进货订单";
  dialogVisible.value = true;
  currentId.value = undefined;
  Object.assign(form, {
    id: 0,
    user_id: "",
    order_type: 1,
    number: 0,
    total_money: "",
    role_id: 0,
    user_name: "",
    created_at: "",
    goods_list: [
      {
        goods_id: 0,
        number: 0,
        goods_name: "",
        purchasing_price: 0,
        joint_venture_purchasing_price: 0,
        ordinary_users_price: 0,
        student_price: 0,
        shipping_cost_price: 0,
      },
    ],
  });
};

const handleEdit = (row: any) => {
  dialogTitle.value = "编辑进货订单";
  console.log("row---", row);
  dialogVisible.value = true;
  currentId.value = row.id;
  Object.assign(form, {
    ...row,
  });
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm("确认删除该记录?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 确保在请求前设置token
      await deleteOrderRecord(row.id);
      ElMessage.success("删除成功");
      fetchData();
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      let { role_id, goods_list, user_id, id, order_type, created_at } = form;
      if (goods_list.length) {
        let error = false;
        goods_list.forEach((item) => {
          if (!item.goods_id) {
            error = true;
          }
        });
        if (error) {
          ElMessage.error("每一条记录必须选择商品");
          return;
        }
      }
      let params = {
        role_id,
        goods_list,
        user_id,
        id,
        order_type,
        created_at,
      };
      console.log("params-------->>", params);
      if (currentId.value) {
        await updateOrderRecord(currentId.value, params);
      } else {
        await createOrderRecord(params);
      }
      ElMessage.success("保存成功");
      dialogVisible.value = false;
      currentPage.value = 1;
      fetchData();
    }
  });
};

onMounted(() => {
  fetchData();
  getGoodsCategoryListData();
});
const searchUserForm = reactive({
  name: "",
  mobile: "",
});

const userDialogVisible = ref(false);
const userList = ref([]);
const userTotal = ref(0);
const userCurrentPage = ref(1);
const openUserDialog = () => {
  const { order_type } = form;
  dialogUserTitle.value = order_type == 1 ? "选择购买人" : "选择采购人员";
  userFetchData();
  userDialogVisible.value = true;
};
// 获取管理员列表数据
const queryUserData = async () => {
  userCurrentPage.value = 1;
  userFetchData();
};
// 获取管理员列表数据
const userFetchData = async () => {
  loading.value = true;
  let params = {
    page: userCurrentPage.value,
    ...searchUserForm,
    order_type: form.order_type,
  };
  const response = await getAdminList(params);
  loading.value = false;
  if (response.data && Array.isArray(response.data.list)) {
    userList.value = response.data.list || [];
    userTotal.value = response.data.total;
  }
};
const selectUser = (userInfo: any) => {
  const { id, name, role_id } = userInfo;
  Object.assign(form, {
    user_id: id,
    user_name: name,
    role_id,
  });
  userDialogVisible.value = false;
};
const userCurrentChange = (val: number) => {
  currentPage.value = val;
  console.log(`current page: ${val}`);
  userFetchData();
};

// 商品选择
const goodsDialogVisible = ref(false);
const goodsList = ref([]);
const goodsTotal = ref(0);
const goodsCurrentPage = ref(1);
const searchGoodsForm = reactive({
  name: "",
});
const goodsIndex = ref(0);
const openGoodsDialog = (index) => {
  goodsIndex.value = index;
  goodsFetchData();
  goodsDialogVisible.value = true;
};
const selectGoods = (goodsInfo: any) => {
  const {
    id,
    name,
    shipping_cost_price,
    joint_venture_purchasing_price,
    ordinary_users_price,
    purchasing_cost_price,
    student_price,
  } = goodsInfo;
  form.goods_list[goodsIndex.value].goods_id = id;
  form.goods_list[goodsIndex.value].goods_name = name;
  form.goods_list[goodsIndex.value].purchasing_price = shipping_cost_price;
  form.goods_list[goodsIndex.value].ordinary_users_price = ordinary_users_price;
  form.goods_list[goodsIndex.value].joint_venture_purchasing_price =
    joint_venture_purchasing_price;
  form.goods_list[goodsIndex.value].purchasing_cost_price =
    purchasing_cost_price;
  form.goods_list[goodsIndex.value].student_price = student_price;
  goodsDialogVisible.value = false;
};

const queryGoodsData = async () => {
  goodsCurrentPage.value = 1;
  goodsFetchData();
};
const goodsFetchData = async () => {
  loading.value = true;
  let params = {
    page: goodsCurrentPage.value,
    ...searchGoodsForm,
    type: form.order_type,
  };
  let response: any = await getGoodsList(params);
  if (response.code == 200) {
    goodsList.value = response.data.list || [];
    goodsTotal.value = response.data.total;
  }
  loading.value = false;
};
const goodsCurrentChange = (val: number) => {
  goodsCurrentPage.value = val;
  console.log(`current page: ${val}`);
  goodsFetchData();
};
const dialogFormVisible = ref(false);
const logisticsForm = reactive({
  id: "",
  logistics_company_code: "",
  logistics_number: "",
});
const logistics_list = reactive([
  { logistics_company_code: "", logistics_number: "" },
]);

const logisticsFormRules = {
  logistics_company_code: [
    { required: true, message: "请选择物流公司", trigger: "change" },
  ],
  logistics_number: [
    { required: true, message: "请填写物流号", trigger: "change" },
  ],
};
const deliverOrder = (Info: any) => {
  const { id } = Info;
  Object.assign(logisticsForm, {
    id,
    logistics_company_code: "",
    logistics_number: "",
  });
  dialogFormVisible.value = true;
};
const logisticsFormAdd = () => {
  logistics_list.push({
    logistics_company_code: "",
    logistics_number: "",
  });
};
const logisticsFormRemove = (index) => {
  logistics_list.splice(index, 1);
};

const logisticsFormSubmit = async () => {
  const res = logistics_company_code_options.value.filter(
    (item) => item.value == logisticsForm.logistics_company_code
  )[0];

  let params = [];
  let errorMsg = "";
  logistics_list.forEach((elem) => {
    const { logistics_company_code, logistics_number } = elem;
    if (!logistics_number || !logistics_company_code) {
      errorMsg = "验证失败";
    }
    const res = logistics_company_code_options.value.filter(
      (item) => item.value == elem.logistics_company_code
    )[0];
    let logistics_company = "";
    if (res) {
      logistics_company = res.label;
    }
    params.push({
      ...elem,
      logistics_company,
    });
  });
  if (errorMsg) {
    ElMessage.error("验证失败,物流号或者物流公司必填");
    return;
  }
  console.log("params--->.", {
    logistics_list: params,
    order_id: logisticsForm.id,
  });

  let response: any = await deliverOrderApi({
    logistics_list: params,
    order_id: logisticsForm.id,
  });
  if (response.code == 200) {
    fetchData();
    dialogFormVisible.value = false;
  }
};
const addGoods = async () => {
  console.log("addGoods");
  form.goods_list.push({
    goods_id: 0,
    number: 0,
    goods_name: "",
    purchasing_price: 0,
    shipping_cost_price: 0,
    joint_venture_purchasing_price: 0,
    ordinary_users_price: 0,
    purchasing_cost_price: 0,
    student_price: 0,
  });
};
const removeGoods = async (index) => {
  //arr.splice(index, 1);
  console.log("removeGoods");
  form.goods_list.splice(index, 1);
};
const goodsCategoryList = ref([{ id: "", category_name: "" }]);
const getGoodsCategoryListData = async () => {
  loading.value = true;
  let response: any = await getGoodsCategoryList({ isAll: 1, limit: 1000 });
  if (response.code == 200) {
    goodsCategoryList.value = response.data.list || [];
  }
  loading.value = false;
};
const logistics_company_code_options = ref([
  { value: "yuantong", label: "圆通速递" },
  { value: "jtexpress", label: "极兔速递" },
  { value: "zhongtong", label: "中通快递" },
  { value: "yunda", label: "韵达快递" },
  { value: "shentong", label: "申通快递" },
  { value: "youzhengguonei", label: "邮政快递包裹" },
  { value: "shunfeng", label: "顺丰速运" },
  { value: "jd", label: "京东物流" },
  { value: "ems", label: "EMS" },
  { value: "youzhengdsbk", label: "邮政电商标快" },
  { value: "debangkuaidi", label: "德邦快递" },
  { value: "youzhengbk", label: "邮政标准快递" },
  { value: "danniao", label: "菜鸟速递" },
  { value: "zhongtongkuaiyun", label: "中通快运" },
  { value: "debangwuliu", label: "德邦物流" },
  { value: "annengwuliu", label: "安能快运" },
  { value: "kuayue", label: "跨越速运" },
  { value: "shunfengkuaiyun", label: "顺丰快运" },
  { value: "baishiwuliu", label: "百世快运" },
  { value: "jingdongkuaiyun", label: "京东快运" },
  { value: "annto", label: "安得物流" },
  { value: "sxjdfreight", label: "顺心捷达" },
  { value: "yundakuaiyun", label: "韵达快运" },
  { value: "subida", label: "速必达" },
]);
</script>

<style lang="scss" scoped>
.role-container {
  padding: 20px;
  min-width: 1280px;
  .role-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .item {
        display: flex;
        gap: 10px;
        .title {
          width: 100px;
        }
        .input {
          width: 70%;
        }
      }

      .title {
        font-size: 16px;
        font-weight: 600;
      }
      .search-box {
        span {
          margin-left: 10px;
        }
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
.search-box {
  display: flex;
  padding: 0 20px 20px 20px;
  span {
    margin-left: 10px;
  }
}
.goods-item {
  border: 1px solid #ccc;
  padding: 10px 0;
  position: relative;
  margin-bottom: 10px;
  .goods-add {
    position: absolute;
    right: 10px;
    z-index: 10;
  }
}
.order-content {
  min-width: 680px;
}
.user-list {
  .user-item {
    .title {
      padding-right: 10px;
    }
  }
}
.item-logistics {
  width: calc(100% - 100px);
  position: relative;
  .btn-remove {
    position: absolute;
    right: -100px;
    top: 0;
  }
}
</style>