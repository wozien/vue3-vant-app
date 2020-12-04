// 工作流请求相关

import http, { HttpRes } from './http'

// 获取首页流程数量
export const fetchFlowNum = async (): Promise<HttpRes> => {
  const res = await http.get('/flowable/auditNum')
  return res.data
}

// 获取流程列表数据
export const fetchFlowList = async (type: string, user: string, offset: number): Promise<HttpRes> => {
  let res = await http.post('/flowable/auditList', {
    args: [{
      type,
      user,
      offset,
      limit: 10,
      order: 'desc'
    }]
  })
  return res.data
}