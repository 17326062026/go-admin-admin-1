import request from "@/utils/request";

export function monthly_bill(data) {
  return request({
    url: "/admin/monthly_bill",
    method: "get",
    params: data,
  });
}
export function quarterly_bill(data) {
  return request({
    url: "/admin/quarterly_bill",
    method: "get",
    params: data,
  });
}
export function getDashboardData() {
  return request({
    url: "/admin/dashboard",
    method: "get",
  });
}
export function getSalesChartOptionData(data: any) {
  return request({
    url: "/admin/getSalesChartOption",
    method: "get",
    params: data,
  });
}

export function expenses_accounts(data: any) {
  return request({
    url: "/admin/expenses_accounts",
    method: "get",
    params: data,
  });
}
export function get_config_info(data: any) {
  return request({
    url: "/admin/get_config_info",
    method: "get",
    params: data,
  });
}

export function add_expenses_accounts(data: any) {
  return request({
    url: "/admin/expenses_accounts",
    method: "post",
    params: data,
  });
}
export function update_expenses_accounts(currentId: Number, data: any) {
  return request({
    url: "/admin/expenses_accounts/" + currentId,
    method: "put",
    data,
  });
}

export function deleteExpenses_accounts(id: number) {
  return request({
    url: `/admin/expenses_accounts/${id}`,
    method: "delete",
  });
}

export function update_monthly_billApi(data: any) {
  return request({
    url: "/admin/update_monthly_bill",
    method: "post",
    data,
  });
}
export function update_quarterly_billApi(data: any) {
  return request({
    url: "/admin/update_quarterly_bill",
    method: "post",
    data,
  });
}
export function order_goods_by_user_id(data: any) {
  return request({
    url: "/admin/order/orderGoodsByUserId",
    method: "get",
    params: data,
  });
}
export function goods_monthly_bill(data: any) {
  return request({
    url: "/admin/order/orderGoodsListStatistics",
    method: "get",
    params: data,
  });
}
export function get_user_bill_list_api(data) {
  return request({
    url: "/admin/user_bill_list",
    method: "get",
    params: data,
  });
}
export function getCategoryGoodsSalesApi(data) {
  return request({
    url: "/admin/getCategoryGoodsSales",
    method: "get",
    params: data,
  });
}
