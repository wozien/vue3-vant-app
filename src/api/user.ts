/**
 * 用户相关接口
 */

import http from '../utils/http'
import { callKw } from './odoo'

// 用户登录
export const userLogin = async (
  account: string,
  password: string,
  wxOpenId: Nullable<string>
): Promise<HttpRes> => {
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

// 创建公司
export const createCompany = async (name: string, type: string, size: string): HttpResPromise => {
  const res = await http.post(
    '/system/create_company',
    {
      company_name: name,
      company_size: size,
      industry_type: type
    },
    {
      timeout: 0
    }
  )
  return res.data
}

// 获取用户组织
export const fetchUserOrgs = async (): Promise<HttpRes> => {
  const res = await callKw('res.users', 'get_org_ids')
  return res.data
}

// 设置用户当前组织
export const switchUserOrg = async (orgId: number): Promise<HttpRes> => {
  const res = await callKw('res.users', 'set_org_id', [orgId])
  return res.data
}

// 用户上传头像
export const uploadUserAvatar = async (avatar: File, phone: string): Promise<HttpRes> => {
  const formData = new FormData()
  formData.append('avatar', avatar)
  formData.append('login', phone)
  const res = await http.post('/system/upload_avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// 获取微信用户的openid
export const getWxOpenId = async (code: string): Promise<HttpRes> => {
  const res = await http.get('/wechat/oauth2', {
    params: { code }
  })

  return res.data
}

// 根据微信openid获取用户登录token
export const getToken = async (wxOpenId: string): Promise<HttpRes> => {
  const res = await http.get('/system/check_login_status', {
    params: { wxOpenId }
  })

  return res.data
}
