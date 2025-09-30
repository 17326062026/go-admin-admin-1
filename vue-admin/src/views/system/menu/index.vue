<template>
  <div class="menu-container">
    <el-row :gutter="20">
      <!-- 左侧树形结构 -->
      <el-col :span="8">
        <el-card class="menu-card tree-card">
          <template #header>
            <div class="card-header">
              <span class="title">菜单树</span>
              <div class="header-actions">
                <el-button type="primary" icon="Plus" size="small" @click="handleAdd">添加菜单</el-button>
                <el-button type="info" icon="Refresh" size="small" @click="fetchData">刷新</el-button>
              </div>
            </div>
          </template>

          <el-tree ref="treeRef" :data="menuList" node-key="id" :props="{ label: 'menu_name', children: 'children' }" highlight-current default-expand-all @node-click="handleNodeClick">
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span>
                  <el-icon v-if="data.router_icon">
                    <component :is="data.router_icon" />
                  </el-icon>
                  {{ node.label }}
                </span>
                <span class="tree-node-actions">
                  <el-button type="primary" size="small" circle @click.stop="handleEdit(data)">
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>
                  <el-button type="danger" size="small" circle @click.stop="handleDelete(data)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧详情和子菜单 -->
      <el-col :span="16">
        <!-- 上部分：当前选中菜单详情 -->
        <el-card class="menu-card detail-card" v-if="currentMenu">
          <template #header>
            <div class="card-header">
              <span class="title">菜单详情</span>
              <div class="header-actions">
                <el-button type="primary" size="small" icon="Edit" @click="handleEdit(currentMenu)">
                  编辑
                </el-button>
                <el-button type="success" size="small" icon="Plus" @click="handleAddChild(currentMenu)">
                  添加子菜单
                </el-button>
              </div>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ currentMenu.id }}</el-descriptions-item>
            <el-descriptions-item label="菜单名称">{{ currentMenu.menu_name }}</el-descriptions-item>
            <el-descriptions-item label="路径">{{ currentMenu.router_path }}</el-descriptions-item>
            <el-descriptions-item label="组件">{{ currentMenu.components }}</el-descriptions-item>
            <el-descriptions-item label="图标">
              <div class="icon-display">
                <el-icon>
                  <component :is="currentMenu.router_icon" />
                </el-icon>
                <span>{{ currentMenu.router_icon }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="排序">{{ currentMenu.sort }}</el-descriptions-item>
            <el-descriptions-item label="父菜单" v-if="currentMenu.parent_id">
              {{ getParentMenuName(currentMenu.parent_id) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <div v-else class="empty-detail">
          <el-empty description="请选择左侧菜单项查看详情" />
        </div>

        <!-- 下部分：子菜单列表 -->
        <el-card class="menu-card children-card" v-if="currentMenu">
          <template #header>
            <div class="card-header">
              <span class="title">子菜单列表</span>
            </div>
          </template>

          <div v-if="currentMenu && currentMenu.children && currentMenu.children.length > 0">
            <el-table :data="currentChildren" style="width: 100%" border row-key="id" stripe>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="menu_name" label="菜单名称" />
              <el-table-column prop="router_path" label="路径" />
              <el-table-column prop="components" label="组件" />
              <el-table-column prop="router_icon" label="图标">
                <template #default="{ row }">
                  <div class="icon-display">
                    <el-icon>
                      <component :is="row.router_icon" />
                    </el-icon>
                    <span>{{ row.icon }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sort" label="排序" width="100" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="暂无子菜单" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 菜单编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="菜单名称" prop="menu_name">
          <el-input v-model="form.menu_name" />
        </el-form-item>
        <el-form-item label="路径" prop="router_path">
          <el-input v-model="form.router_path" />
        </el-form-item>
        <el-form-item label="组件" prop="components">
          <el-input v-model="form.components" />
        </el-form-item>
        <el-form-item label="图标" prop="router_icon">
          <div class="icon-input-wrapper">
            <el-input v-model="form.router_icon" placeholder="选择或输入图标名称" />
            <el-button type="primary" @click="showIconPicker">
              <el-icon><Select /></el-icon>
              选择图标
            </el-button>
          </div>
          <div class="selected-icon-preview" v-if="form.router_icon">
            <span>预览：</span>
            <el-icon>
              <component :is="form.router_icon" />
            </el-icon>
            <span>{{ form.router_icon }}</span>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="父菜单" v-if="form.parent_id !== undefined">
          <el-cascader v-model="form.parent_id" :options="parentMenuOptions" :props="cascaderProps" clearable placeholder="请选择父菜单" :show-all-levels="true" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 图标选择器对话框 -->
    <el-dialog title="选择图标" v-model="iconPickerVisible" width="700px" destroy-on-close>
      <div class="icon-search">
        <el-input v-model="iconSearch" placeholder="搜索图标" clearable>
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div class="icon-list">
        <div v-for="icon in filteredIcons" :key="icon" class="icon-item" :class="{ 'is-selected': selectedIcon === icon }" @click="selectIcon(icon)">
          <el-icon>
            <component :is="icon" />
          </el-icon>
          <span class="icon-name">{{ icon }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="iconPickerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmIconSelection">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Edit, Delete, Select, Search } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import { getMenuList, createMenu, updateMenu, deleteMenu } from "@/api/menu";

const menuList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const currentId = ref<number>();
const currentMenu = ref<any>(null);
const treeRef = ref();

// 图标选择器相关
const iconPickerVisible = ref(false);
const iconSearch = ref("");
const selectedIcon = ref("");

// Cascader 配置
const cascaderProps = {
  value: "id",
  label: "menu_name",
  children: "children",
  checkStrictly: true, // 允许选择任意级别的节点
  emitPath: false, // 只返回选中节点的值，而不是路径
};

// Element Plus 图标列表
const elementIcons = [
  "AddLocation",
  "Aim",
  "AlarmClock",
  "Apple",
  "ArrowDown",
  "ArrowDownBold",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Avatar",
  "Back",
  "Baseball",
  "Basketball",
  "Bell",
  "BellFilled",
  "Bicycle",
  "Bottom",
  "BottomLeft",
  "BottomRight",
  "Bowl",
  "Box",
  "Briefcase",
  "Brush",
  "BrushFilled",
  "Burger",
  "Calendar",
  "Camera",
  "CameraFilled",
  "CaretBottom",
  "CaretLeft",
  "CaretRight",
  "CaretTop",
  "Cellphone",
  "ChatDotRound",
  "ChatDotSquare",
  "ChatLineRound",
  "ChatLineSquare",
  "ChatRound",
  "ChatSquare",
  "Check",
  "Checked",
  "Cherry",
  "Chicken",
  "ChromeFilled",
  "CircleCheck",
  "CircleCheckFilled",
  "CircleClose",
  "CircleCloseFilled",
  "CirclePlus",
  "CirclePlusFilled",
  "Clock",
  "Close",
  "CloseBold",
  "Cloudy",
  "Coffee",
  "CoffeeCup",
  "Coin",
  "ColdDrink",
  "Collection",
  "CollectionTag",
  "Comment",
  "Compass",
  "Connection",
  "Coordinate",
  "CopyDocument",
  "Cpu",
  "CreditCard",
  "Crop",
  "DArrowLeft",
  "DArrowRight",
  "DCaret",
  "DataAnalysis",
  "DataBoard",
  "DataLine",
  "Delete",
  "DeleteFilled",
  "DeleteLocation",
  "Dessert",
  "Discount",
  "Dish",
  "DishDot",
  "Document",
  "DocumentAdd",
  "DocumentChecked",
  "DocumentCopy",
  "DocumentDelete",
  "DocumentRemove",
  "Download",
  "Drizzling",
  "Edit",
  "EditPen",
  "Eleme",
  "ElemeFilled",
  "ElementPlus",
  "Expand",
  "Failed",
  "Female",
  "Files",
  "Film",
  "Filter",
  "Finished",
  "FirstAidKit",
  "Flag",
  "Fold",
  "Folder",
  "FolderAdd",
  "FolderChecked",
  "FolderDelete",
  "FolderOpened",
  "FolderRemove",
  "Food",
  "Football",
  "ForkSpoon",
  "Fries",
  "FullScreen",
  "Goblet",
  "GobletFull",
  "GobletSquare",
  "GobletSquareFull",
  "Goods",
  "GoodsFilled",
  "Grape",
  "Grid",
  "Guide",
  "Handbag",
  "Headset",
  "Help",
  "HelpFilled",
  "Hide",
  "Histogram",
  "HomeFilled",
  "HotWater",
  "House",
  "IceCream",
  "IceCreamRound",
  "IceCreamSquare",
  "IceDrink",
  "IceTea",
  "InfoFilled",
  "Iphone",
  "Key",
  "KnifeFork",
  "Lightning",
  "Link",
  "List",
  "Loading",
  "Location",
  "LocationFilled",
  "LocationInformation",
  "Lock",
  "Lollipop",
  "MagicStick",
  "Magnet",
  "Male",
  "Management",
  "MapLocation",
  "Medal",
  "Memo",
  "Menu",
  "Message",
  "MessageBox",
  "Mic",
  "Microphone",
  "MilkTea",
  "Minus",
  "Money",
  "Monitor",
  "Moon",
  "MoonNight",
  "More",
  "MoreFilled",
  "MostlyCloudy",
  "Mouse",
  "Mug",
  "Mute",
  "MuteNotification",
  "NoSmoking",
  "Notebook",
  "Notification",
  "Odometer",
  "OfficeBuilding",
  "Open",
  "Operation",
  "Opportunity",
  "Orange",
  "Paperclip",
  "PartlyCloudy",
  "Pear",
  "Phone",
  "PhoneFilled",
  "Picture",
  "PictureFilled",
  "PictureRounded",
  "PieChart",
  "Place",
  "Platform",
  "Plus",
  "Pointer",
  "Position",
  "Postcard",
  "Pouring",
  "Present",
  "PriceTag",
  "Printer",
  "Promotion",
  "QuartzWatch",
  "Question",
  "QuestionFilled",
  "Rank",
  "Reading",
  "ReadingLamp",
  "Refresh",
  "RefreshLeft",
  "RefreshRight",
  "Refrigerator",
  "Remove",
  "RemoveFilled",
  "Right",
  "ScaleToOriginal",
  "School",
  "Scissor",
  "Search",
  "Select",
  "Sell",
  "SemiSelect",
  "Service",
  "SetUp",
  "Setting",
  "Share",
  "Ship",
  "Shop",
  "ShoppingBag",
  "ShoppingCart",
  "ShoppingCartFull",
  "Smoking",
  "Soccer",
  "SoldOut",
  "Sort",
  "SortDown",
  "SortUp",
  "Stamp",
  "Star",
  "StarFilled",
  "Stopwatch",
  "SuccessFilled",
  "Sugar",
  "Suitcase",
  "Sunny",
  "Sunrise",
  "Sunset",
  "Switch",
  "SwitchButton",
  "TakeawayBox",
  "Ticket",
  "Tickets",
  "Timer",
  "ToiletPaper",
  "Tools",
  "Top",
  "TopLeft",
  "TopRight",
  "TrendCharts",
  "Trophy",
  "TrophyBase",
  "TurnOff",
  "Umbrella",
  "Unlock",
  "Upload",
  "User",
  "UserFilled",
  "Van",
  "VideoCamera",
  "VideoCameraFilled",
  "VideoPause",
  "VideoPlay",
  "View",
  "Wallet",
  "WalletFilled",
  "Warning",
  "WarningFilled",
  "Watch",
  "Watermelon",
  "WindPower",
  "ZoomIn",
  "ZoomOut",
];

// 过滤后的图标列表
const filteredIcons = computed(() => {
  if (!iconSearch.value) return elementIcons;
  return elementIcons.filter((icon) =>
    icon.toLowerCase().includes(iconSearch.value.toLowerCase())
  );
});

// 表单数据
const form = reactive({
  components: "",
  menu_name: "",
  router_path: "",
  router_icon: "",
  sort: 0,
  parent_id: undefined as number | undefined,
});

// 表单验证规则
const rules = {
  menu_name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  router_path: [{ required: true, message: "请输入路径", trigger: "blur" }],
  router_icon: [{ required: true, message: "请选择图标", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
};

// 获取父菜单名称
const getParentMenuName = (parentId: any) => {
  const parent: any = menuList.value.find((item: any) => item.id === parentId);
  return parent ? parent.menu_name : "未知菜单";
};

// 为级联选择器准备的父菜单选项
const parentMenuOptions = computed(() => {
  // 添加顶级菜单选项
  let options = [
    {
      id: 0,
      menu_name: "无 (顶级菜单)",
      children: [],
    },
  ];
  menuList.value.forEach((element: any) => {
    if (!element.parent_id) {
      options.push(element);
    }
  });
  return options;
});

// 当前选中菜单的子菜单
const currentChildren = computed(() => {
  if (!currentMenu.value) return [];
  console.log("currentMenu.value.children----->>", currentMenu.value.children);
  return currentMenu.value.children || [];
});

// 获取菜单列表数据
const fetchData = async () => {
  loading.value = true;
  const response: any = await getMenuList();
  if (response.code == 200) {
    menuList.value = response.data || [];
  }
  loading.value = false;
};

// 处理树节点点击
const handleNodeClick = (data: any) => {
  currentMenu.value = data;
};

// 添加顶级菜单
const handleAdd = () => {
  dialogTitle.value = "添加菜单";
  dialogVisible.value = true;
  currentId.value = undefined;
  Object.assign(form, {
    menu_name: "",
    router_path: "",
    router_icon: "",
    sort: 0,
    parent_id: 0, // 默认为顶级菜单
  });
};

// 添加子菜单
const handleAddChild = (parentMenu: any) => {
  dialogTitle.value = "添加子菜单";
  dialogVisible.value = true;
  currentId.value = undefined;
  Object.assign(form, {
    menu_name: "",
    router_path: "",
    router_icon: "",
    sort: 0,
    parent_id: parentMenu.id,
  });
};

// 编辑菜单
const handleEdit = (row: any) => {
  dialogTitle.value = "编辑菜单";
  dialogVisible.value = true;
  currentId.value = row.id;
  Object.assign(form, {
    ...row,
    parent_id: row.parent_id || 0,
  });
};

// 删除菜单
const handleDelete = (row: any) => {
  // 检查是否有子菜单
  const hasChildren = menuList.value.some((item:any) => item.parent_id === row.id);

  if (hasChildren) {
    ElMessage.warning("该菜单下有子菜单，请先删除子菜单");
    return;
  }

  ElMessageBox.confirm("确认删除该菜单?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await deleteMenu(row.id);
        ElMessage.success("删除成功");

        // 如果删除的是当前选中的菜单，清空选中状态
        if (currentMenu.value && currentMenu.value.id === row.id) {
          currentMenu.value = null;
        }

        fetchData();
      } catch (error) {
        console.error("删除菜单失败:", error);
        ElMessage.error("删除失败");

        // 如果API请求失败，模拟删除成功
        menuList.value = menuList.value.filter((item) => item.id !== row.id);

        // 如果删除的是当前选中的菜单，清空选中状态
        if (currentMenu.value && currentMenu.value.id === row.id) {
          currentMenu.value = null;
        }
      }
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

// 显示图标选择器
const showIconPicker = () => {
  selectedIcon.value = form.router_icon;
  iconPickerVisible.value = true;
  iconSearch.value = "";
};

// 选择图标
const selectIcon = (icon: any) => {
  selectedIcon.value = icon;
};

// 确认图标选择
const confirmIconSelection = () => {
  form.router_icon = selectedIcon.value;
  iconPickerVisible.value = false;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 确保在请求前设置token
      const submitData = { ...form };
      // 检查是否会形成循环引用
      if (currentId.value && submitData.parent_id) {
        // 获取所有子菜单ID
        const getAllChildrenIds = (menuId: any) => {
          const childrenIds: any = [];
          const children = menuList.value.filter(
            (item: any) => item.parent_id === menuId
          );

          children.forEach((child: any) => {
            childrenIds.push(child.id);
            childrenIds.push(...getAllChildrenIds(child.id));
          });

          return childrenIds;
        };

        const childrenIds = getAllChildrenIds(currentId.value);

        if (childrenIds.includes(submitData.parent_id)) {
          ElMessage.error("不能选择自己的子菜单作为父菜单，这会导致循环引用");
          return;
        }
      }

      if (currentId.value) {
        await updateMenu(currentId.value, submitData);
      } else {
        await createMenu(submitData);
      }
      ElMessage.success("保存成功");
      dialogVisible.value = false;
      fetchData();
    }
  });
};

onMounted(() => {
  // 确保在组件挂载时设置token
  fetchData();
});

onActivated(() => {
  // 确保在组件激活时设置token
  fetchData();
});
</script>

<style lang="scss" scoped>
.menu-container {
  padding: 20px;

  .menu-card {
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
        gap: 8px;
      }
    }
  }

  .tree-card {
    height: calc(100vh - 180px);
    overflow: auto;
  }

  .detail-card {
    margin-bottom: 20px;
  }

  .children-card {
    height: calc(100vh - 450px);
    overflow: auto;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;

    .tree-node-actions {
      display: none;
    }

    &:hover .tree-node-actions {
      display: inline-flex;
      gap: 5px;
    }
  }

  .empty-detail {
    height: 3 00px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    margin-bottom: 20px;
  }

  .icon-input-wrapper {
    display: flex;
    gap: 10px;

    .el-input {
      flex: 1;
    }
  }

  .selected-icon-preview {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;

    .el-icon {
      font-size: 18px;
      color: #409eff;
    }
  }

  .icon-search {
    margin-bottom: 20px;
  }

  .icon-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.is-selected {
        background-color: #ecf5ff;
        color: #409eff;
        border: 1px solid #d9ecff;
      }

      .el-icon {
        font-size: 24px;
        margin-bottom: 5px;
      }

      .icon-name {
        font-size: 12px;
        word-break: break-all;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }
  }

  .icon-display {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 18px;
      color: #409eff;
    }
  }
}

@media screen and (max-width: 768px) {
  .menu-container {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  }
}
</style>