import request from '@/utils/request'

interface LoginData {
  name: string
  password: string
}

export function login(data: LoginData) {
  // 使用 GET 请求并添加查询参数
  return request({
    url: `/admin/login`,
    method: 'post',
    data,  // 使用 params 而不是 data 来发送 GET 请求参数
    headers: {
      'Content-Type': 'application/json'
    }
  })
}