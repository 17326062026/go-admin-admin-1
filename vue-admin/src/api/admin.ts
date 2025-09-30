import request from "@/utils/request";

export function getAdminList(data: any) {
  return request({
    url: "/admin/index",
    method: "get",
    params: data,
  });
}

export function createAdmin(data: any) {
  return request({
    url: "/admin/register",
    method: "post",
    data,
  });
}

export function updateAdmin(id: number, data: any) {
  return request({
    url: `/admin/updateUser`,
    method: "put",
    data,
  });
}
export function updateUserPassword(data) {
  return request({
    url: `/admin/updateUserPassword`,
    method: "put",
    data,
  });
}

export function deleteAdmin(id: number) {
  return request({
    url: `/admin/deleteUser/${id}`,
    method: "delete",
  });
}
export function getAdminInfo() {
  return request({
    url: "/admin/info",
    method: "get",
  });
}
export function updateUserRole(data: any) {
  return request({
    url: "/admin/updateUserRole",
    method: "post",
    data,
  });
}
export function getUserChildren(data:any) {
  return request({
    url: "/admin/getUserChildren",
    method: "get",
    params: data,
  })
}
export function examineUserStatus(data: any) {
  return request({
    url: "/admin/examineUserStatus",
    method: "post",
    data,
  });
}
export function getDashboard(data: any) {
  return request({
    url: "/admin/user/dashboard",
    method: "get",
  });
}
