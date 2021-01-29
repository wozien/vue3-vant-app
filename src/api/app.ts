/**
 * 应用类
 */

import http, { HttpRes } from './http'
import { loadAction, searchRead } from './odoo'
import Domain from '@/assets/js/odoo/Domain'
import pyUtils from '@/assets/js/odoo/py_utils'

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

// 获取应用的模型
export const fetchAppModel = async (modelKey: string): Promise<HttpRes> => {
  const res = await http.get('/meta/mobile/app_model', {
    params: {
      model_key: modelKey
    }
  })

  return res.data
}

// 获取应用的视图
export const fetchAppView = async (actionId: number): Promise<HttpRes> => {
  const res = await http.get('/meta/mobile/app_view', {
    params: {
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
  limit?: number,
  domain?: any[]
) => Promise<HttpRes> = async (model, lastId, searchFields, limit = 6, domain = []) => {
  const arrayToString = Domain.prototype.arrayToString
  const stringToArray = Domain.prototype.stringToArray

  // console.log(pyUtils.assembleDomains([arrayToString([['id', '<', lastId]]), arrayToString([['id', '<', lastId]])], 'AND'))
  // 构造odoo的查询domain
  const lastIdDomain = lastId ? [['id', '<', lastId]] : []
  const queryDomain = domain.length ?
    pyUtils.assembleDomains([arrayToString(domain), arrayToString(lastIdDomain)], 'AND') : lastIdDomain
  
  const res = await searchRead({
    model,
    domain: stringToArray(queryDomain),
    limit,
    fields: searchFields
  })

  return res.data
} 
