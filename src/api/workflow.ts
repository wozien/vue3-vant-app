// 工作流请求相关

import http, { HttpRes } from './http'

// 获取首页流程数量
export const fetchFlowNum = async (): Promise<HttpRes> => {
  const res = await http.get('/flowable/auditNum')
  return res.data
}