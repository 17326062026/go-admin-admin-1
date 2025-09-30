import request from '@/utils/request'

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/admin/info',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data: any) {
  return request({
    url: '/admin/update-profile',
    method: 'put',
    data
  })
}

// 修改密码
export function changePassword(data: any) {
  return request({
    url: '/admin/change-password',
    method: 'put',
    data
  })
}