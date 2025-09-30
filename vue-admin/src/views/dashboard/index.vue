<template>
  <div class="dashboard-container" :class="userStore.role_id!==1 ?'bgc':''">
    <!-- 统计卡片 -->
    <el-row :gutter="20" v-if="userStore.role_id==1">
      <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in stats" :key="index">
        <div class="stat-card" :style="{ background: stat.bgColor }">
          <div class="stat-card-content">
            <div class="stat-card-info">
              <div class="stat-card-title">{{ stat.title }}</div>
              <div class="stat-card-value">{{ stat.value }}</div>
            </div>
            <div class="stat-card-icon">
              <el-icon>
                <component :is="stat.icon" />
              </el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表和数据卡片 -->
    <el-row v-if="userStore.role_id==1" :gutter="20" v-loading="loading">
      <!-- 左侧图表 -->
      <el-col :xs="24" :md="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>出货额趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small" @change="updateSalesChart">
                <el-radio-button label="week">近一周</el-radio-button>
                <el-radio-button label="month">近一月</el-radio-button>
                <!-- <el-radio-button label="year">全年</el-radio-button> -->
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="salesChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div v-if="userStore.role_id!==1" style="text-align: center;">
      <img src="@/assets/permissions.png" alt="">
    </div>
  </div>
</template>

<script setup>
import { getAdminInfo } from "@/api/admin";
import { ref, onMounted } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { useUserStore } from "@/store/modules/user";
import { getDashboardData, getSalesChartOptionData } from "@/api/index";
const userStore = useUserStore();
console.log("userStore-dashboard-role_id", userStore.role_id);
// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);
const loading = ref(false);
// 统计卡片数据
const stats = ref([
  {
    title: "合作伙伴人数",
    value: "12,321",
    id: 1,
    icon: "User",
    bgColor: "linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)",
  },
  {
    id: 2,
    title: "出货总订单量",
    value: "856",
    icon: "ShoppingCart",
    bgColor: "linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)",
  },
  {
    id: 3,
    title: "出货总金额",
    value: "¥128,590",
    icon: "Money",
    bgColor: "linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)",
  },
  {
    id: 4,
    title: "月度总奖励金额",
    value: "321",
    icon: "UserFilled",
    bgColor: "linear-gradient(135deg, #FF5E62 0%, #FF9966 100%)",
  },
]);

// 图表时间范围
const chartTimeRange = ref("week");

// 销售趋势图表配置
const salesChartOption = ref({
  title: {
    text: "出货额趋势图",
    left: "center",
    textStyle: {
      fontSize: 16,
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  legend: {
    data: ["销售额", "订单量"],
    bottom: 0,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "10%",
    top: "15%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    axisLine: {
      lineStyle: {
        color: "#999",
      },
    },
    axisLabel: {
      color: "#666",
    },
  },
  yAxis: [
    {
      type: "value",
      name: "销售额",
      axisLabel: {
        formatter: "{value} 元",
        color: "#666",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#999",
        },
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#eee",
        },
      },
    },
    {
      type: "value",
      name: "订单量",
      axisLabel: {
        formatter: "{value} 单",
        color: "#666",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#999",
        },
      },
      splitLine: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: "销售额",
      type: "line",
      smooth: true,
      data: [
        24500, 28600, 32800, 36900, 29800, 32600, 48200, 52300, 42100, 38600,
        52800, 64500,
      ],
      itemStyle: {
        color: "#409EFF",
      },
      lineStyle: {
        width: 3,
      },
    },
    {
      name: "订单量",
      type: "bar",
      yAxisIndex: 1,
      data: [154, 185, 206, 187, 189, 214, 256, 270, 240, 216, 254, 325],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#83bff6" },
          { offset: 0.5, color: "#188df0" },
          { offset: 1, color: "#188df0" },
        ]),
      },
    },
  ],
});

// 更新销售图表数据
const updateSalesChart = async (timeRange) => {
  let xAxisData = [];
  let salesData = [];
  let orderData = [];
  let response = {};
  loading.value = true;
  if (timeRange === "week") {
    // xAxisData = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    // salesData = [7800, 8200, 9100, 8600, 9800, 12500, 11200];
    // orderData = [42, 45, 53, 49, 58, 62, 47];

    response = await getSalesChartOptionData({ timeRange: "week" });
  } else if (timeRange === "month") {
    xAxisData = Array.from({ length: 30 }, (_, i) => `${i + 1}日`);
    salesData = Array.from(
      { length: 30 },
      () => Math.floor(Math.random() * 5000) + 3000
    );
    orderData = Array.from(
      { length: 30 },
      () => Math.floor(Math.random() * 30) + 20
    );

    response = await getSalesChartOptionData({ timeRange: "month" });
  } else if (timeRange === "year") {
    xAxisData = [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ];
    salesData = [
      24500, 28600, 32800, 36900, 29800, 32600, 48200, 52300, 42100, 38600,
      52800, 64500,
    ];
    orderData = [154, 185, 206, 187, 189, 214, 256, 270, 240, 216, 254, 325];
    response = await getSalesChartOptionData({ timeRange: "year" });
  }
  loading.value = false;
  if (response.code == 200) {
    let result = response.data || {};
    xAxisData = result.xAxisData;
    salesData = result.salesData;
    orderData = result.orderData;
  }
  salesChartOption.value.xAxis.data = xAxisData;
  salesChartOption.value.series[0].data = salesData;
  salesChartOption.value.series[1].data = orderData;
};

// 组件挂载时初始化图表
onMounted(() => {
  updateSalesChart(chartTimeRange.value);
});
const fetchData = async () => {
  const userStore = useUserStore();
  await userStore.getUserInfo();
  let response = await getDashboardData();
  if (response.code == 200) {
    let result = response.data || {};
    stats.value.forEach((item) => {
      if (item.id == 1) {
        item.value = result.user_total;
      }
      if (item.id == 2) {
        item.value = result.order_total;
      }
      if (item.id == 3) {
        item.value = `¥ ${result.order_total_money}`;
      }
      if (item.id == 4) {
        item.value = `¥ ${result.reward_amount_total}`;
      }
    });
  }
};
// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  // 统计卡片样式
  .stat-card {
    height: 120px;
    border-radius: 8px;
    padding: 20px;
    color: white;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .stat-card-content {
      display: flex;
      justify-content: space-between;
      height: 100%;
    }

    .stat-card-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .stat-card-title {
      font-size: 16px;
      color: #ffffff;
      margin-bottom: 5px;
    }

    .stat-card-value {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-card-change {
      font-size: 14px;
      display: flex;
      align-items: center;

      &.up {
        color: #ffffff;
      }

      &.down {
        color: #ffffff;
      }

      .el-icon {
        margin-right: 4px;
      }
    }

    .stat-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 12px;
      margin-right: 10px;
      margin-top: 10px;

      .el-icon {
        font-size: 32px;
        color: #fff;
      }
    }
  }

  // 图表卡片样式
  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .chart-container {
      height: 350px;
      width: 100%;

      .chart {
        height: 100%;
        width: 100%;
      }
    }
  }

  // 活动列表样式
  .activity-content {
    .activity-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .activity-desc {
      color: #909399;
      font-size: 13px;
    }
  }

  // 系统状态样式
  .system-status {
    .status-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .status-label {
        margin-bottom: 8px;
        font-weight: 500;
      }
    }
  }

  // 快捷操作样式
  .quick-actions {
    .quick-action-item {
      height: 90px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      margin-bottom: 10px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .el-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }

      span {
        font-size: 14px;
      }
    }
  }

  // 项目进度样式
  .project-name {
    display: flex;
    align-items: center;

    .el-avatar {
      margin-right: 10px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 16px;
      font-weight: 600;
    }
  }

  // 热门文章样式
  .article-list {
    .article-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .article-rank {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background-color: #f5f7fa;
        color: #909399;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 12px;

        &.top-rank {
          background-color: #ff9966;
          color: white;
        }
      }

      .article-info {
        flex: 1;

        .article-title {
          font-size: 14px;
          color: #303133;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .article-meta {
          font-size: 12px;
          color: #909399;

          span {
            margin-right: 10px;
          }
        }
      }
    }
  }

  // 用户分布样式
  .user-distribution {
    .distribution-item {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      .distribution-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;

        .distribution-name {
          font-size: 14px;
          color: #606266;
        }

        .distribution-value {
          font-size: 14px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
  }

  // 待办事项样式
  .todo-list {
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .todo-done {
        text-decoration: line-through;
        color: #909399;
      }

      .todo-date {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  // 数据概览样式
  .data-overview-card {
    margin-bottom: 20px;

    .data-item {
      display: flex;
      align-items: center;
      padding: 15px;

      .data-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        .el-icon {
          font-size: 24px;
          color: white;
        }
      }

      .data-content {
        flex: 1;

        .data-title {
          font-size: 14px;
          color: #909399;
          margin-bottom: 5px;
        }

        .data-value {
          font-size: 20px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .data-change {
          font-size: 12px;
          display: flex;
          align-items: center;

          &.up {
            color: #67c23a;
          }

          &.down {
            color: #f56c6c;
          }

          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .dashboard-container {
    .stat-card {
      height: auto;
      margin-bottom: 15px;

      .stat-card-content {
        flex-direction: column;

        .stat-card-icon {
          margin-top: 10px;
          justify-content: flex-start;
        }
      }
    }

    .chart-card {
      .chart-container {
        height: 250px;
      }
    }

    .quick-actions {
      .quick-action-item {
        height: 80px;
      }
    }
  }
}
.bgc {
  background-color: #faf8fb;
}
</style>