/**
 * odoo 请求接口封装
 */

import http from '../utils/http'
import { AxiosResponse } from 'axios'
import { getContext } from '@/logics/class/App'
interface OdooRpcParams {
  args: any[]
  kwargs: Recordable
  model: string
  method: string
}

interface OdooCallKwFunc {
  (model: string, method: string, args?: any[], kwargs?: any): Promise<AxiosResponse>
}

interface OdooSearchRead {
  (
    options: {
      model: string
      domain?: any[]
      fields: string[]
      limit?: number
      sort?: string
      context?: Record<string, any>
    },
    isOdoo?: boolean
  ): Promise<AxiosResponse>
}

/**
 * 模拟 odoo rpc 请求
 * @param url
 * @param params
 * @returns
 */
function _odooRpcRequest(url: string, params: OdooRpcParams) {
  const context = getContext()
  params.kwargs.context = Object.assign({}, params.kwargs.context || {}, context)
  return http.post(url, { ...params })
}

/**
 * odoo /web/dataset/call_kw 请求
 * @param model
 * @param method
 * @param args
 */
export const callKw: OdooCallKwFunc = (model, method, args = [], kwargs = {}) => {
  const url = `/meta/web/dataset/call_kw/${model}/${method}`
  const params: OdooRpcParams = {
    model,
    method,
    args,
    kwargs
  }

  return _odooRpcRequest(url, params)
}

/**
 * /meta/mobile/callkw
 * @param model
 * @param method
 * @param args
 */
export const mobileCallKw: OdooCallKwFunc = (model, method, args = [], kwargs = {}) => {
  const url = `/meta/mobile/call_kw/${model}/${method}`
  const context = getContext()
  kwargs.context = Object.assign({}, kwargs.context || {}, context)
  const params: OdooRpcParams = {
    model,
    method,
    args,
    kwargs
  }

  return _odooRpcRequest(url, params)
}

/**
 * odoo call_button
 * @param model
 * @param method
 * @param args
 * @param kwargs
 */
export const callButton: (
  model: string,
  method: string,
  args: any[],
  kwargs?: any
) => Promise<HttpRes> = async (model, method, args = [], kwargs = {}) => {
  const url = '/meta/web/dataset/call_button'
  const res = await _odooRpcRequest(url, { model, method, args, kwargs })
  return res.data
}

/**
 * odoo  /web/dataset/search_read
 * @param options
 */
export const searchRead: OdooSearchRead = (options, isOdoo = false) => {
  const params = Object.assign(
    {
      limit: 10,
      sort: 'id desc',
      domain: []
    },
    options
  )
  const url = isOdoo ? '/meta/web/dataset/search_read' : '/meta/mobile/search_read'

  return http.post(url, { ...params, context: getContext(undefined, true) })
}

/**
 * 获取odoo action
 * @param actionId
 */
export const loadAction = (actionId: number) => {
  const params = {
    action_id: actionId
  }
  return http.post('/meta/web/action/load', { ...params })
}
