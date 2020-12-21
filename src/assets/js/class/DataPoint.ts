/**
 * 表单记录的相关操作
 */

import _ from 'lodash'
import { ViewType } from './index'
import { fetchRecord } from '@/api/app'
import { FieldsInfo } from '@/assets/js/class'
import fieldUtils from '@/assets/js/utils/field-utils'
import { str2Date } from '@/assets/js/utils/date'

export type DataPointId = string
type DataPointType = 'record' | 'list'
export interface DataPoint {
  _changes: Object | null
  id: DataPointId
  type: DataPointType
  viewType: ViewType
  data: { 
    id?: number
    [key: string]: any
  }
  model: string
  res_id?: number | string
  fieldsInfo: FieldsInfo
  parentId?: DataPointId
  [key: string]: any
}

interface LoadParams {
  viewType: ViewType
  modelName: string
  fieldsInfo: FieldsInfo
  res_id?: number | string
  type?: DataPointType
  parentId?: DataPointId
  data?: { 
    id?: number
    [key: string]: any
  }
}

export const localData: {
  [key: string]: DataPoint
} = {}

// -----  private methods

/**
* 增加新的data point数据
* @param params 
*/
const _makeDataPoint = <T extends LoadParams>(params: T): DataPoint => {
  let res_id, type = params.type || 'record'
  const data = type === 'record' ? {} : []
  if(type === 'record') {
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
    res_id
  }

  localData[dataPoint.id] = dataPoint
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
    _.extend(record, { 
      data: recordData.data,
      creator:{
        ...recordData.create_user,
        date: str2Date(res.data.create_date || '')
      },
      ..._.pick(recordData, ['state', 'workflow_state'])
    })
    _parseServerData(record)
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


// ------  public 

export const load = async (params: LoadParams): Promise<DataPointId> => {
  const dataPoint = _makeDataPoint(params)
  await _load(dataPoint)
  return dataPoint.id
}

