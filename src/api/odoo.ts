/**
 * odoo 请求接口封装
 */

import http, { HttpRes } from './http'
import { AxiosResponse } from 'axios'
import { DomainArr } from '@/assets/js/class'

interface OdooRpcParams {
  args: any[];
  kwargs: Object;
  model: string;
  method: string;
} 

export interface OdooCallKwFunc {
  (model: string, method: string, args?: any[], kwargs?: any): Promise<AxiosResponse>;
}

export interface OdooSearchRead {
  (options: {
    model: string,
    domain?: DomainArr,
    fields: string[],
    limit?: number,
    sort?: string
  }): Promise<AxiosResponse>;
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

  return http.post(url, { ...params })
}

/**
 * /meta/mobile/callkw
 * @param model 
 * @param method 
 * @param args 
 */
export const mobileCallKw: OdooCallKwFunc = (model, method, args = [], kwargs = {}) => {
  const url = `/meta/mobile/call_kw/${model}/${method}`
  const params: OdooRpcParams = {
    model,
    method,
    args,
    kwargs
  }

  return http.post(url, { ...params })
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
  const res = await http.post(url, { model, method, args, kwargs })
  return res.data
}

/**
 * odoo  /web/dataset/search_read
 * @param options 
 */
export const searchRead: OdooSearchRead = (options) => {
  const params = Object.assign({
    limit: 10,
    sort: 'id desc',
    domain: []
  }, options)
  
  return http.post('/meta/mobile/search_read', { ...params })
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