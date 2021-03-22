/**
 * 应用类
 */

import http from './http'
import { callKw, loadAction, searchRead } from './odoo'
import Domain from '@/logics/odoo/Domain'
import pyUtils from '@/logics/odoo/py_utils'

// 获取应用市场数据
export const fetchAppData = async (): Promise<HttpRes> => {
  const res = await http.get('/meta/mobile/get_app_data')
  return res.data
}

// 获取常用应用
export const fetchUsuallyApp = async (): Promise<HttpRes> => {
  const res = await http.get('/meta/mobile/frequently_used_app')
  return res.data
}

/**
 * 获取应用模型和视图
 * @param modelKey 
 * @param actionId 
 * @returns 
 */
export const fetchAppDetail = async(modelKey: string, actionId: number): Promise<HttpRes> => {
  const res = await http.get('/meta/mobile/app_detail', {
    params: {
      model_key: modelKey,
      action_id: actionId
    }
  })

  return res.data
}

// 获取应用对应的action
export const fetchAction = async (actionId: number) : Promise<HttpRes> => {
  const res = await loadAction(actionId)
  return res.data
}

// 应用次数统计
export const addAppCount = async (appId: number): Promise<HttpRes> => {
  const res = await http.post('/meta/mobile/open_app_count', {
    id: appId
  })
  return res.data
}

/**
 * 获取列表数据
 * @param model 
 * @param lastId 
 * @param searchFields 
 * @param limit 
 */
export const fetchListData: (
  model: string,
  lastId: number,
  fields: string[],
  domain: {
    search?: any[],
    action?: any[]
  },
  context?: Record<string, any>
) => Promise<HttpRes> = async (model, lastId, searchFields, domain, context) => {
  const arrayToString = Domain.prototype.arrayToString
  const stringToArray = Domain.prototype.stringToArray
  const actionDomain = domain.action || []
  const searchDomain = domain.search || []

  // console.log(pyUtils.assembleDomains([arrayToString([['id', '<', lastId]]), arrayToString([['id', '<', lastId]])], 'AND'))
  // 构造odoo的查询domain
  const lastIdDomain = lastId ? [['id', '<', lastId]] : []
  const queryDomain = pyUtils.assembleDomains([
    arrayToString(actionDomain), 
    arrayToString(searchDomain),
    arrayToString(lastIdDomain)
  ], 'AND')
  
  const res = await searchRead({
    model,
    limit: 6,
    domain: stringToArray(queryDomain),
    fields: searchFields,
    context: context || {}
  })

  return res.data
} 

/**
 * 按钮权限接口
 * @param model 
 * @param buttons 
 */
export const chekcButtonAccess = async (model: string, buttons: any[]): Promise<HttpRes> => {
  const args = [model, buttons]
  const res = await callKw(model, 'button_access_check', args)
  return res.data
}