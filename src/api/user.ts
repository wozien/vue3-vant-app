/**
 * 用户相关接口
 */

import http, { HttpRes } from './http'
import { callKw } from './odoo'

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

// 获取用户组织
export const fetchUserOrgs = async (): Promise<HttpRes> => {
  const res = await callKw('res.users', 'get_org_ids')
  return res.data
}

// 用户上传头像 
export const uploadUserAvatar = async (avatar: File, phone: string): Promise<HttpRes> => {
  const formData = new FormData()
  formData.append('avatar', avatar)
  formData.append('login', phone)
  const res = await http.post('system/upload_avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  console.log(res)
  return res.data
}