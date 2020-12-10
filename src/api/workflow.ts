// 工作流请求相关

import http, { HttpRes } from './http'
import { callKw, callButton } from './odoo'

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
    bill_number: string,
    task_id: string,
    process_id: string
  }
) => Promise<HttpRes> = async (modelKey, flowParams) => {
  const { type, bill_number, task_id, process_id } = flowParams
  const res = await http.post('/flowable/mobile/workflow_app_view', {
    ...{
      model_key: modelKey, 
      type,
      bill_number,
      task_id,
      process_id
    }
  })
  return res.data
}

// 审批同意
export const flowAgreen = async (opinion: string, context: any): Promise<HttpRes> => {
  const approve_type = context.approve_type || '1'
  const args = [{ approve_type, opinion }]
  let res = await callKw('workflow.approve.wizard', 'create', args, { context })
  if(res.data) {
    res = res.data
    if((res as any).ret === 0) {
      return await callButton('workflow.approve.wizard', 'button_confirm', [[res.data]], { context })
    }
  }
  return res.data
}

// 审批打回
export const flowReturn = async (backNode: string, opinion: string, context: any): Promise<HttpRes> => {
  const args = [{
    opinion,
    back_node: backNode,
    process_id: context.process_id
  }]
  let res = await callKw('workflow.back.wizard', 'create', args, { context })
  if(res.data) {
    res = res.data
    if((res as any).ret === 0) {
      return await callButton('workflow.back.wizard', 'button_back_confirm', [[res.data]], { context })
    }
  }
  return res.data
}

// 审批加签
export const flowSign = async (type: string, selected: any, context: any): Promise<HttpRes> => {
  const params = {
    signBill: [context],
    signConsult: {
      memberList: selected?.members || [],
      roleList: [],
      stationList: []
    },
    signType: type
  }

  const res = await http.post('/flowable/sign', { ...params })
  return res.data
}

// 流程传阅
export const flowCirculate = async (selected: any, context: any): Promise<HttpRes> => {
  const params = {
    context: {},
    instance: [context],
    user: {
      memberList: selected?.members || [],
      roleList: [],
      stationList: []
    }
  }

  const res = await http.post('/flowable/circulate', { ...params })
  return res.data
}


// 获取公司用户数据，用户user-picker
export const fetchCompanyUsers = async (context: any): Promise<HttpRes> => {
  const res = await http.post('/flowable/getUser', {
    context: {},
    instance: context
  })
  return res.data
}