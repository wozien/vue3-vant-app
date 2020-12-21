/**
 * 表单记录的相关操作
 */

import _ from 'lodash'
import { ViewType } from './index'

type DataPointId = string
type DataPointType = 'record' | 'list'
interface DataPoint {
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
}

interface LoadParams {
  type: DataPointType
  viewType: ViewType
  modelName: string
  res_id?: number | string
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
  let { type, res_id } = params
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
    type,
    data,
    res_id
  }

  localData[dataPoint.id] = dataPoint

  return dataPoint
}

const _load = async (dataPoint: DataPoint) => {
  if(dataPoint.type === 'record') {

  }
}


// ------  public 

export const load = async (params: LoadParams): Promise<DataPointId> => {
  const dataPoint = _makeDataPoint(params)

}

