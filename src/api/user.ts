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
