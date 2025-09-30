import request from "@/utils/request";

export function getGoodsList(data) {
  return request({
    url: "/admin/goods",
    method: "get",
    data,
    params: data,
  });
}

export function createGoods(data: any) {
  return request({
    url: "/admin/goods",
    method: "post",
    data,
  });
}

export function updateGoods(id: number, data: any) {
  return request({
    url: `/admin/goods/${id}`,
    method: "put",
    data,
  });
}

export function deleteGoods(id: number) {
  return request({
    url: `/admin/goods/${id}`,
    method: "delete",
  });
}

export function uploadFile(data) {
  return request({
    url: `/admin/uploadFile`,
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
