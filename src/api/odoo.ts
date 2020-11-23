/**
 * odoo 请求接口封装
 */

import http from './http'
import { AxiosResponse } from 'axios'

interface OdooRpcParams {
  args: any[];
  kwargs: Object;
  model: string;
  method: string;
} 

export interface OdooCallKwFunc {
  (model: string, method: string, ...args: any[]): Promise<AxiosResponse>;
}

/**
 * odoo call_kw 请求
 * @param model 
 * @param method 
 * @param args 
 */
export const callKw: OdooCallKwFunc = (model, method, ...args) => {
  const url = `/meta/web/dataset/call_kw/${model}/${method}`
  const params: OdooRpcParams = {
    model,
    method,
    args,
    kwargs: {}
  }

  return http.post(url, { ...params })
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