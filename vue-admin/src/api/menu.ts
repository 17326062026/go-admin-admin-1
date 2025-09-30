import request from '@/utils/request'

export function getMenuList() {
  return request({
    url: '/admin/menus/allList',
    method: 'get'
  })
}

export function createMenu(data: any) {
  return request({
    url: '/admin/menu/add',
    method: 'post',
    data
  })
}

export function updateMenu(id: number, data: any) {
  return request({
    url: `/admin/menu/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteMenu(id: number) {
  return request({
    url: `/admin/menu/delete/${id}`,
    method: 'delete'
  })
}