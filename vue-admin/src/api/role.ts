import request from '@/utils/request'

export function getRoleList(data) {
  return request({
    url: '/admin/role/list',
    method: 'get',
    data,
    params:data
  })
}

export function createRole(data: any) {
  return request({
    url: '/admin/role/add',
    method: 'post',
    data
  })
}

export function updateRole(id: number, data: any) {
  return request({
    url: `/admin/role/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id: number) {
  return request({
    url: `/admin/role/delete/${id}`,
    method: 'delete'
  })
}