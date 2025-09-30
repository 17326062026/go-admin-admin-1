import request from "@/utils/request";

export function productsList(data:any) {
  return request({
    url: "/admin/products",
    method: "get",
    params: data,
  });
}

export function createProducts(data: any) {
  return request({
    url: "/admin/products",
    method: "post",
    data,
  });
}

export function updateProducts(id: number, data: any) {
  return request({
    url: `/admin/products/${id}`,
    method: "put",
    data,
  });
}

export function deleteProducts(id: number) {
  return request({
    url: `/admin/products/${id}`,
    method: "delete",
  });
}

export function getProducts(id: number) {
  return request({
    url: `/admin/products/${id}`,
    method: "get",
  });
}