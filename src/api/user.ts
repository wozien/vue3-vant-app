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

// 用户退出登录
export const userLogout = async (): Promise<HttpRes> => {
  const res = await http.post('/system/logout')
  return res.data
}

// 用户信息
export const fetchUserInfo = async (): Promise<HttpRes> => {
  const res = await http.get('/system/user_info')
  return res.data
}

// 公司列表
export const fetchCompanyList = async (): Promise<HttpRes> => {
  const res = await http.get('/system/company_list')
  return res.data
}

// 切换公司
export const switchCompany = async (dbName: string, oauthUrl: string): Promise<HttpRes> => {
  const res = await http.post('/system/switch_company', {
    dbName,
    oauth2LoginUrl: oauthUrl
  })
  return res.data
}