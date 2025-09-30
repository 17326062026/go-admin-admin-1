import request from "@/utils/request";

export function getConfigList(data) {
  return request({
    url: "/admin/config",
    method: "get",
    data,
    params: data,
  });
}

export function createConfig(data: any) {
  return request({
    url: "/admin/config",
    method: "post",
    data,
  });
}

export function updateConfig(id: number, data: any) {
  return request({
    url: `/admin/config/${id}`,
    method: "put",
    data,
  });
}

export function deleteConfig(id: number) {
  return request({
    url: `/admin/config/${id}`,
    method: "delete",
  });
}