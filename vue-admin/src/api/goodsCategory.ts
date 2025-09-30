import request from "@/utils/request";

export function getGoodsCategoryList(data) {
  return request({
    url: "/admin/goodsCategory",
    method: "get",
    data,
    params: data,
  });
}
export function createGoodsCategory(data: any) {
  return request({
    url: "/admin/goodsCategory",
    method: "post",
    data,
  });
}

export function updateGoodsCategory(id: number, data: any) {
  return request({
    url: `/admin/goodsCategory/${id}`,
    method: "put",
    data,
  });
}

export function deleteGoodsCategory(id: number) {
  return request({
    url: `/admin/goodsCategory/${id}`,
    method: "delete",
  });
}