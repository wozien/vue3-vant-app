// 工作流请求相关

import http, { HttpRes } from './http'
import { callKw } from './odoo'

// 获取首页流程数量
export const fetchFlowNum = async (): Promise<HttpRes> => {
  const res = await http.get('/flowable/auditNum')
  return res.data
}

// 获取流程列表数据
export const fetchFlowList = async (type: string, user: string, offset: number): Promise<HttpRes> => {
  const res = await http.post('/flowable/auditList', {
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

// 获取工作流的穿透的视图
export const fetchFlowView: (
  modelKey: string,
  flowParams: {
    type: string,
    billNumber: string,
    taskId: string,
    processId: string
  }
) => Promise<HttpRes> = async (modelKey, flowParams) => {
  const { type, billNumber, taskId, processId } = flowParams
  const res = await http.get('/flowable/mobile/workflow_app_view', {
    params: {
      model_key: modelKey, 
      type,
      bill_number: billNumber,
      task_id: taskId,
      process_id: processId
    }
  })
  return res.data
}

// 审批同意
export const flowAgreen = async (opinion: string, context: any): Promise<HttpRes> => {
  const approve_type = context.approve_type || '1'
  const args = [{ approve_type, opinion }]
  const res = await callKw('workflow.approve.wizard', 'create', args, { context })
  return res.data
}