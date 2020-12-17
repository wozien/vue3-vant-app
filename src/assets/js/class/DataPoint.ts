/**
 * 表单记录的相关操作
 */

interface DataPoint {
  id: string
  type: 'record' | 'list'
  data: { 
    id: number,
    [key: string]: any
  },
  model: string
  res_id: number,
  _changes: Object | null
}

interface LoadParams {
  type: string
  viewType: string
}

export const localData: DataPoint[] = []


