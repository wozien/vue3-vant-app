import { ViewType, FieldsInfo } from './index'

export type DataPointId = string
export type DataPointType = 'record' | 'list'
export type DataPointData = {
  id?: number
  [key: string]: any
}

interface DataPointProps {
  _changes: any
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
  },
  domain?: any[]
}

export type LocalData = {
  [key: string]: DataPoint
}