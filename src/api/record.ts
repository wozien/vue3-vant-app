/**
 * 表单记录
 */

import { mobileCallKw, callKw, callButton, searchRead } from './odoo'
import http from '@/utils/http'

/**
 * 获取表单数据
 * @param model
 * @param recordId
 * @param searchFields
 */
export const fetchRecord: (
  model: string,
  id: number | number[],
  fields: string[]
) => Promise<HttpRes> = async (model, recordId, searchFields = []) => {
  let res
  let args = [recordId, searchFields]
  if (Array.isArray(recordId)) {
    res = await callKw(model, 'read', args)
  } else {
    res = await mobileCallKw(model, 'read', args)
  }
  return res.data
}

/**
 * m2o字段数据获取
 * @param model
 */
export const fetchMany2OneData = async (
  relation: string,
  model: string,
  searchValue = '',
  domain: any = [],
  context?: Recordable
): Promise<HttpRes> => {
  const kw = {
    operator: 'ilike',
    name: searchValue,
    view_type: 'form',
    model,
    args: domain,
    context: context || {}
  }
  const res = await callKw(relation, 'ps_name_search', [], kw)
  return res.data
}

/**
 * 默认值获取
 * @param model
 * @param fieldNames
 */
export const fetchDefaultValues = async (model: string, fieldNames: string[]) => {
  const res = await callKw(model, 'default_get', [fieldNames || []])
  return res.data
}

/**
 * odoo name_get 接口
 * @param model
 * @param resID
 */
export const fetchNameGet = async (model: string, resID: number | number[]): Promise<HttpRes> => {
  const res = await callKw(model, 'name_get', [resID])
  return res.data
}

/**
 * 单据保存
 * @param model
 * @param method
 * @param id
 * @param changes
 */
export const saveRecord = async (
  model: string,
  method: string,
  id: number,
  changes: any
): Promise<HttpRes> => {
  const args = method === 'write' ? [[id], changes] : [changes]
  const res = await callKw(model, method, args, {})
  return res.data
}

/**
 * 删除表单记录
 * @param model
 * @param id
 */
export const deleteRecord = async (model: string, id: number, context = {}): Promise<HttpRes> => {
  let { data: res } = await callKw('sys.admin.delete.confirm.wizard', 'create', [{}], { context })
  if (res) {
    if ((res as HttpRes).ret === 0) {
      return await callButton('sys.admin.delete.confirm.wizard', 'wizard_confirm', [[res.data]], {
        context
      })
    }
  }

  return res.data
}

/**
 * odoo onchange
 * @param model
 * @param args
 * @param context
 */
export const fetchOnChange = async (model: string, args: any[], context = {}): Promise<HttpRes> => {
  let res = await callKw(model, 'flex_onchange_domain', args, { context })
  return res.data
}

/**
 * 动态获取弹性域字段信息
 * @param domain
 */
export const fetchFlexFields = async (domain: any[]): Promise<HttpRes> => {
  let res = await callKw('ir.model.flex.fields', 'get_flex_fields', domain)
  return res.data
}

/**
 * 获取表单的沟通记录
 * @param model
 * @param recordID
 * @param actionID
 * @returns
 */
export const fetchFormChats = async (
  model: string,
  recordID: number,
  actionID?: number
): HttpResPromise => {
  const res = await callKw('mail.message', 'get_doc_messages', [model, recordID, actionID])
  return res.data
}

/**
 * 发送表单沟通记录
 * @param model
 * @param recordID
 * @param content
 * @returns
 */
export const postFormMessage = async (
  model: string,
  recordID: number,
  content: string
): HttpResPromise => {
  let res = await callKw('mail.channel', 'doc_note_post', [model, recordID], { content })
  return res.data
}

/**
 * 单据沟通记录的格式化
 * @param id
 * @returns
 */
export const formMessageFormat = async (id: number): HttpResPromise => {
  const res = await callKw('mail.message', 'message_format', [[id]])
  return res.data
}

/**
 * 获取附件列表
 * @param model
 * @param id
 * @returns
 */
export const fetchAttachment = async (model: string, id: number): HttpResPromise => {
  const domain = ['&', ['res_model', '=', model], ['res_id', '=', id]]
  const fields = ['key', 'id', 'mimetype', 'type', 'url', 'name', 'file_size']
  const res = await searchRead(
    {
      model: 'ir.attachment',
      domain,
      fields
    },
    true
  )
  return res.data
}

/**
 * 附件上传
 * @param model
 * @param file
 * @returns
 */
export const uploadAttachment = async (model: string, file: File): HttpResPromise => {
  const formData = new FormData()
  formData.append('model', model)
  formData.append('ufile', file)
  const res = await http.post('/meta/mobile/upload_attachment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

/**
 * 附件和单据绑定
 * @param id
 * @param recordID
 * @param method
 * @returns
 */
export const flushAttachment = async (
  id: number,
  recordID: number,
  method = 'write'
): HttpResPromise => {
  const args = [[id]] as any[]
  if (method === 'write') {
    args.push({ res_id: recordID })
  }
  const res = await callKw('ir.attachment', method, args)
  return res.data
}

/**
 * 获取关联单据数据
 * @param model
 * @param id
 * @returns
 */
export const fetchFormRelated = async (model: string, id: number): HttpResPromise => {
  const res = await http.get('/meta/mobile/related_doc', {
    params: {
      model,
      record_id: id
    }
  })
  return res.data
}
