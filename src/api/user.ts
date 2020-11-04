/**
 * 用户相关接口
 */

import http, { HttpRes } from './http'

// 用户登录
export const userLogin = async (account: string, password: string, wxOpenId = '1'): Promise<HttpRes> => {
  const res = await http.post('/system/login', {
    account,
    wxOpenId,
    pwd: password
  })

  return res.data
}

// 用户信息
export const fetchUserInfo = async (): Promise<HttpRes> => {
  const res = await http.get('/system/user_info')
  return res.data
}
