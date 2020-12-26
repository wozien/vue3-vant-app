/**
 * 表单记录的相关操作
 */

import _ from 'lodash'
import { ViewType } from './index'
import { fetchRecord } from '@/api/app'
import { FieldsInfo } from '@/assets/js/class'
import fieldUtils from '@/assets/js/utils/field-utils'
import { str2Date } from '@/assets/js/utils/date'
import { saveRecord } from '@/api/app'

export type DataPointId = string
export type DataPointType = 'record' | 'list'
export type DataPointData = {
  id?: number
  [key: string]: any
}

interface DataPointProps {
  _changes: Object | null
  id: DataPointId
  type: DataPointType
  viewType: ViewType
  model: string
  res_id: number | string | undefined
  res_ids: (number | string)[]
  fieldsInfo: FieldsInfo
  parentId?: DataPointId
  [key: string]: any
}
export interface DataPoint extends DataPointProps {
  data: DataPointData
}

export interface DataPointState extends DataPointProps {
  data: DataPoint | DataPoint[] | { 
    id?: number
    [key: string]: any
  }
}

export interface LoadParams {
  viewType: ViewType
  modelName: string
  fieldsInfo: FieldsInfo
  res_id?: number | string
  res_ids?: (number | string)[]
  type?: DataPointType
  parentId?: DataPointId
  data?: { 
    id?: number
    [key: string]: any
  }
}

type LocalData = {
  [key: string]: DataPoint
}

// -----  private methods  ----------

/**
 * 表单值修改处理
 * @param recordID 
 * @param changes 
 */
const _applyChange = (recordID: DataPointId, changes: DataPointData) => {
  const record = localData[recordID]
  record._changes = record._changes || {}

  // apply changes to local data
  for(let fieldName in changes) {
    const field = record.fieldsInfo[fieldName]
    if(field && (field.type === 'one2many' || field.type === 'many2many')) {
      // TODO
    } else if(field && (field.type === 'many2one' || field.type === 'reference')) {
      // TODO
    } else {
      (record._changes as any)[fieldName] = changes[fieldName]
    }
  }

  // TODO trigger onchange handle
}

/**
* 增加新的data point数据
* @param params 
*/
const _makeDataPoint = <T extends LoadParams>(params: T): DataPoint => {
  let res_id, type = params.type || 'record'
  let res_ids = params.res_ids || []
  const data = params.data || (type === 'record' ? {} : [])
  if(type === 'record') {
    res_id = params.res_id || params.data?.id
    if(res_id) {
      (data as any).id = res_id
    } else {
      res_id = _.uniqueId('virtual_')
    }
  }

  const dataPoint: DataPoint = {
    _changes: null,
    id: _.uniqueId(params.modelName + '_'),
    model: params.modelName,
    viewType: params.viewType,
    fieldsInfo: params.fieldsInfo,
    type,
    data,
    res_id,
    res_ids
  }

  localData[dataPoint.id] = dataPoint
  if(dataPoint.type === 'record') {
    recordMap.set(`${dataPoint.model}_${res_id}`, dataPoint.id)
  }
  return dataPoint
}

/**
 * 获取字段名数组
 * @param dataPoint 
 */
const _getFieldsName = (dataPoint: DataPoint) => {
  return Object.keys(dataPoint.fieldsInfo || {})
}

/**
 * 获取更新的数据
 * @param record 
 * @param options
 */
const _generateChanges = (record: DataPoint, options: any) => {
  options = options || {}
  // let viewType = options.viewType || record.
  let changes
  if('changesOnly' in options && !options.changesOnly) {
    changes = _.extend({}, record.data, record._changes)
  } else {
    changes = _.extend({}, record._changes)
  }

  // TODO get x2many commands

  for(let fieldName in record.fieldsInfo) {
    const type = record.fieldsInfo[fieldName].type
    
    if(type === 'one2many' || type === 'many2many') {
      // TODO
    } else if(type === 'many2one' && fieldName in changes) {
      // TODO
    } else if(type === 'reference' && fieldName in changes) {
      // TODO 
    } else if(type === 'char' && (changes as any)[fieldName] === '') {
      (changes as any)[fieldName] = false
    } else if((changes as any)[fieldName] === null) {
      (changes as any)[fieldName] = false
    }
  }

  return changes
}

/**
 * 解析接口返回的字段值
 * @param field 
 * @param val 
 */
const _parseServerValue = (field: any, value: any) => {
  if(field.type === 'date' || field.type === 'datetime') {
    value = (fieldUtils.parse as any)[field.type](value, field)
  }
  return value
}

/**
 * 解析服务期返回的数据，m2o创建dataPoint
 * @param fieldsInfo 
 * @param data 
 */
const _parseServerData = (record: DataPoint) => {
  const data = record.data
  const fieldsInfo = record.fieldsInfo
  _.each(fieldsInfo, (field: any, fieldName: string) => {
    const val = data[fieldName]
    if(field.type === 'many2one') {
      if(val !== false) {
        const r = _makeDataPoint({
          modelName: field.relation,
          data: {
            id: val[0],
            display_name: val[1]
          },
          fieldsInfo: {
            id: { type: 'integer', name: 'id'},
            display_name: { type: 'char', name: 'display_name'} 
          },
          parentId: record.id,
          viewType: 'form'
        })
        data[fieldName] = r.id
      } else {
        data[fieldName] = false
      }
    } else  {
      data[fieldName] = _parseServerValue(field, val)
    }
  })
}

/**
 * 请求表单数据
 * @param record 
 */
const _fetchRecord = async (record: DataPoint) => {
  const { model, res_id } = record
  const fieldNames = _getFieldsName(record)
  const res = await fetchRecord(model, res_id as number, fieldNames)
  if(res.ret === 0) {
    const recordData = res.data
    if(recordData.odoo_data.length) {
      _.extend(record, { 
        data: recordData.odoo_data[0],
        creator:{
          ...recordData.create_user,
          date: str2Date(res.data.create_date || '')
        },
        ..._.pick(recordData, ['state', 'state_name'])
      })
      _parseServerData(record)
      await _fetchX2Manys(record)
    }
  }
}

/**
 * 构造表体的dataPoint
 * @param record 
 */
const _fetchX2Manys = async (record: DataPoint) => {
  const fieldsInfo = record.fieldsInfo
  const defs = [] as any[]
  _.each(fieldsInfo, (field: any, fieldName: string) => {
    if(field.type === 'one2many' || field.type === 'many2many') {
      const ids = record.data[fieldName] || []
      const fieldInfo = record.fieldsInfo[fieldName]
      const fieldsInfo = fieldInfo.list || {}
      // TODO 暂不考虑表体是联动视图的情况
      const list = _makeDataPoint({
        type: 'list',
        viewType: 'list',
        modelName: field.relation,
        res_ids: ids,
        fieldsInfo
      })
      record.data[fieldName] = list.id
      defs.push(_fetchX2ManysData(list))
    }
  })
  return Promise.all(defs)
}

/**
 * 请求表体数据
 * @param list 
 */
const _fetchX2ManysData = async (list: DataPoint) => {
  const { model, res_ids } = list
  const res = await fetchRecord(model, res_ids as number[], _getFieldsName(list))
  if(res.ret === 0) {
    const records = res.data
    _.each(res_ids, (id: any) => {
      const data = _.find(records, { id })
      if(data) {
        const dataPoint = _makeDataPoint({
          viewType: list.viewType,
          parentId: list.id,
          modelName: list.model,
          res_id: id,
          fieldsInfo: list.fieldsInfo,
          data
        })
        _parseServerData(dataPoint)
        list.data.push(dataPoint.id)
      }
    })
  }
}

/**
 * 加载dataPoint数据
 * @param dataPoint 
 */
const _load = async (dataPoint: DataPoint) => {
  if(dataPoint.type === 'record') {
    await _fetchRecord(dataPoint)
  }
}


// ------  public  ------------

export let localData: LocalData = {}
export const recordMap = new Map<string, DataPointId>()

/**
 * 表单数据加载入口, 只会调用一次
 * @param params 
 */
export const load = async (params: LoadParams): Promise<DataPointId> => {
  _.each(_.keys(localData), (key: string) => {
    _.unset(localData, key)
  })
  
  const dataPoint = _makeDataPoint(params)
  await _load(dataPoint)
  return dataPoint.id
}

/**
 * 判断是否新的记录
 * @param id 
 */
export const isNew = (id: DataPointId) => {
  const data = localData[id];
  if (data.type !== 'record') {
      return false;
  }
  const res_id = data.res_id;
  if (typeof res_id === 'number') {
      return false;
  } else if (typeof res_id === 'string' && /^[0-9]+-/.test(res_id)) {
      return false;
  }
  return true;
}

/**
 * 获取DataPointState(合并_changes到data中)
 * @param id 
 */
export const get = (id: DataPointId) => {
  if(!(id in localData)) return null

  const element = localData[id]
  if(element.type === 'record') {
    const data = _.extend({}, element.data, element._changes || {})
    for(let fieldName in data) {
      const field = element.fieldsInfo[fieldName]
      if(data[fieldName] == null) {
        data[fieldName] = false
      }
      if(!field) continue

      if(field.type === 'many2one') {
        data[fieldName] = get(data[fieldName]) || false
      } else if(field.type === 'reference') {
        // TODO reference field handle
      } else if(field.type === 'one2many' || field.type === 'many2many') {
        data[fieldName] = get(data[fieldName]) || []
      }
    }

    return {
      ...element,
      data
    }
  }

  const list = {
    ...element,
    data: _.map(element.data, (id: DataPointId) => get(id))
  } as any

  return list
}

/**
 * 根据模型和记录id获取DataPointId
 * @param modelKey 
 * @param res_id 
 */
export const getRecordId = (modelKey: string, res_id: string): DataPointId => {
  return recordMap.get(`${modelKey}_${res_id}`) as DataPointId
}

/**
 * 值更新入口
 * @param recordID
 * @param changes 
 */
export const notifyChanges = (recordID: DataPointId, changes: DataPointData) => {
  _applyChange(recordID, changes)
}

/**
 * 单据保存
 * @param recordID 
 */
export const save = async (recordID: DataPointId) => {
  const record = localData[recordID]
  const method = isNew(recordID) ? 'create' : 'write'
  if(record._changes) {
    delete (record._changes as any).id
  }

  const changes = _generateChanges(record, { changesOnly: method !== 'create' })

  if(method === 'create' || Object.keys(changes).length) {
    const res = await saveRecord(record.model, method, record.data.id as number, changes)
    return res
  }

  return true
}