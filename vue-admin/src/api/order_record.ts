import request from "@/utils/request";

export function getOrderRecordList(data) {
  return request({
    url: "/admin/order_record",
    method: "get",
    data,
    params: data,
  });
}

export function createOrderRecord(data: any) {
  return request({
    url: "/admin/order_record",
    method: "post",
    data,
  });
}

export function updateOrderRecord(id: number, data: any) {
  return request({
    url: `/admin/order_record/${id}`,
    method: "put",
    data,
  });
}

export function deleteOrderRecord(id: number) {
  return request({
    url: `/admin/order_record/${id}`,
    method: "delete",
  });
}
export function deliverOrderApi(data: any) {
  return request({
    url: "/admin/deliver_order_record",
    method: "post",
    data,
  });
}