import Layout from "../layout/index.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as XLSX from "xlsx"; // 如果使用模块化
import dayjs from 'dayjs';
export function transformRoutes(routes) {
  return routes.map((route) => {
    const modules = import.meta.glob("@/views/**/*.vue");
    const componentPath = `/src/views${route.components}.vue`;
    return {
      title: route.menu_name,
      meta: {
        title: route.menu_name,
        icon: route.router_icon,
      },
      name: route.router_path,
      path: route.router_path,
      component: route.children ? Layout : modules[componentPath], // 直接使用预加载的模块
      children: route.children ? transformRoutes(route.children) : [],
    };
  });
}


export function downloadExcelXLSX(data: any, headers: any, fileName = "data") {
  if (!Array.isArray(data)) {
    ElMessage.success("数据必须是数组");
    return;
  }
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  // 将数组转换为工作表
  const ws = XLSX.utils.json_to_sheet(data);
  // 修改表头
  if (headers && headers.length > 0) {
    // 获取工作表范围
    const range = XLSX.utils.decode_range(ws["!ref"]);
    // 替换第一行的内容（表头行）
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1"; // 如 A1, B1, C1...
      const headerText = headers[C] || ws[address]?.v;

      if (!ws[address]) ws[address] = { t: "s" }; // 如果单元格不存在则创建
      ws[address].v = headerText; // 设置单元格值
    }
  }
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  // 生成 Excel 文件并下载
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function getCurrentQuarter() {
  const month = dayjs().month() + 1; // 获取当前月份 (1-12)
  return Math.ceil(month / 3); // 计算季度 (1-4)
}