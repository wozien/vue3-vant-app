/**
 * 表单记录的相关操作 
 * like odoo basic_model
 */

import _ from 'lodash'
import { ViewType } from './index'
import { FieldsInfo } from '@/assets/js/class'
import fieldUtils from '@/assets/js/utils/field-utils'
import { str2Date } from '@/assets/js/utils/date'
import { fetchRecord, saveRecord, fetchDefaultValues } from '@/api/record'
import { sessionStorageKeys } from '@/assets/js/constant'

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
  }
}

type LocalData = {
  [key: string]: DataPoint
}

// -----  private methods  ----------

const x2ManyCommands = {
  // (0, virtualID, {values})
  CREATE: 0,
  create: function (virtualID: string | number, values: any) {
      delete values.id
      return [x2ManyCommands.CREATE, virtualID || false, values]
  },
  // (1, id, {values})
  UPDATE: 1,
  update: function (id: string | number, values: any) {
      delete values.id
      return [x2ManyCommands.UPDATE, id, values]
  },
  // (2, id[, _])
  DELETE: 2,
  delete: function (id: string | number) {
      return [x2ManyCommands.DELETE, id, false]
  }
}

/**
 * 表体增加行
 * @param list 
 */
const _addX2ManyDefaultRecord = async (list: DataPoint, options: any) => {
  options = options || {}
  const params = {
    modelName: list.model,
    fieldsInfo: list.fieldsInfo,
    parentId: list.id,
    viewType: list.viewType
  }

  const recordID = await _makeDefaultRecord(list.model, params)
  list._changes.push({operation: 'ADD', id: recordID, isNew: true})

  if(typeof options.position === 'number') {
    // insert line
    list.data.splice(options.position, 0, recordID)
  } else {
    list.data.push(recordID)
  }

  return recordID
}

/**
 * 根据changes计算最新的res_ids
 * @param list 
 */
const _applyX2ManyOperations = (list: DataPoint) => {
  list = _.extend({}, list)
  list.res_ids = list.res_ids.slice(0)
  const changes = list._changes || []
  _.each(changes, (change: any) => {
    let relRecord
    if(change.id) {
      relRecord = localData[change.id]
    }

    switch (change.operation) {
      case 'ADD': 
        list.res_ids.push(relRecord?.res_id as string)
        break
      case 'DELETE': 
        list.res_ids = _.without(list.res_ids, relRecord?.res_id) as string[]
        break
      case 'UPDATE':
        break
    }
  })

  _setDataInRange(list)
  return list
}

/**
 * 表单值修改处理
 * @param recordID 
 * @param changes 
 */
const _applyChange = (recordID: DataPointId, changes: DataPointData): Promise<any> => {
  const record = localData[recordID]
  record._changes = record._changes || {}
  record._isDirty = true
  const defs = []
  // apply changes to local data
  for(let fieldName in changes) {
    const field = record.fieldsInfo[fieldName]
    if(field && (field.type === 'one2many' || field.type === 'many2many')) {
      defs.push(_applyX2ManyChange(record, fieldName, changes[fieldName]))
    } else if(field && (field.type === 'many2one' || field.type === 'reference')) {
      _applyX2OneChange(record, fieldName, changes[fieldName])
    } else {
      record._changes[fieldName] = changes[fieldName]
    }
  }

  return Promise.all(defs)

  // TODO trigger onchange handle
}

/**
 * many2one 值更新处理
 * @param record 
 * @param fieldName 
 * @param data 
 */
const _applyX2OneChange = (record: DataPoint, fieldName: string, data: any) => {
  if(!data || !data.id) {
    (record._changes as any)[fieldName] = false
    return
  }

  let relatedID
  if (record._changes && fieldName in record._changes) {
      relatedID = record._changes[fieldName];
  } else {
      relatedID = record.data[fieldName];
  }

  const relatedRecord = localData[relatedID];
  if (relatedRecord && (data.id === localData[relatedID].res_id)) {
    return
  }

  const relData = _.pick(data, 'id', 'display_name');
  const field = record.fieldsInfo[fieldName]
  // TODO fetch name_get

  const rec = _makeDataPoint({
    data: relData,
    fieldsInfo: {},
    modelName: field.relation as string,
    parentId: record.id,
    res_id: data.id,
    viewType: 'form'
  });

  record._changes[fieldName] = rec.id
}

/**
 * 表体值更新处理
 * @param record 
 * @param fieldName 
 * @param command 
 */
const _applyX2ManyChange = (record: DataPoint, fieldName: string, command: any) => {
  const localID = (record._changes && record._changes[fieldName]) || record.data[fieldName]
  const list = localData[localID]
  list._changes = list._changes || []
  const defs = []

  switch(command.operation) {
    case 'CREATE':
      defs.push(_addX2ManyDefaultRecord(list, { position: command.position || 'bottom' }))
      break
    case 'UPDATE':
      !_.find(list._changes as any[], {operation: 'UPDATE', id: command.id}) && 
      (list._changes as any[]).push({operation: 'UPDATE', id: command.id})
      if(command.data) {
        defs.push(_applyChange(command.id, command.data))
      }
      break
    case 'DELETE':
      let idsToRemove = command.ids
      list._changes = _.reject(list._changes, function (change: any) {
        var idInCommands =command.ids.includes(change.id);
        if (idInCommands && change.operation === 'ADD') {
            idsToRemove = _.without(idsToRemove, change.id);
        }
        return idInCommands;
      });
      _.each(idsToRemove, function (id: string) {
        var operation = list._forceM2MUnlink ? 'FORGET': 'DELETE';
        list._changes.push({operation: operation, id: id});
      });
      break
  }

  return Promise.all(defs)
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
    _cache: type === 'list' ? {} : undefined,
    _changes: null,
    id: _.uniqueId(params.modelName + '_'),
    model: params.modelName,
    viewType: params.viewType,
    fieldsInfo: params.fieldsInfo,
    parentId: params.parentId,
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
 * 表单创建数据构建
 * @param modelName 
 * @param params 
 */
const _makeDefaultRecord = async (modelName: string, params: LoadParams) => {
  const fieldNames = Object.keys(params.fieldsInfo)
  const record = _makeDataPoint({
    ...params,
    modelName
  })

  // 默认值处理
  const res = await fetchDefaultValues(modelName, fieldNames)
  if(res.ret === 0) {
    applyDefaultValues(record.id, res.data, { fieldNames })
    // TODO fetch m2o data
  }

  return record.id
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
  let changes: any
  if('changesOnly' in options && !options.changesOnly) {
    changes = _.extend({}, record.data, record._changes)
  } else {
    changes = _.extend({}, record._changes)
  }

  // TODO get x2many commands
  const commands = _generateX2ManyCommands(record, {
      changesOnly: 'changesOnly' in options ? options.changesOnly : true,
  })

  for(let fieldName in record.fieldsInfo) {
    const type = record.fieldsInfo[fieldName].type
    
    let value
    if(type === 'one2many' || type === 'many2many') {
      if (commands[fieldName] && commands[fieldName].length) { 
        changes[fieldName] = commands[fieldName];
      }else {
        delete changes[fieldName]
      }
    } else if(type === 'many2one' && fieldName in changes) {
      value = changes[fieldName]
      changes[fieldName] = value ? localData[value].res_id : false
    } else if(type === 'reference' && fieldName in changes) {
      // TODO 
    } else if(type === 'char' && changes[fieldName] === '') {
      changes[fieldName] = false
    } else if(changes[fieldName] === null) {
      changes[fieldName] = false
    }
  }

  return changes
}

/**
 * 获取表体的操作命令
 * @param record 
 * @param options 
 */
const _generateX2ManyCommands = (record: DataPoint, options: any) => {
  options = options || {}
  const commands = {} as any
  const data = _.extend({}, record.data, record._changes)
  for(let fieldName in record.fieldsInfo) {
    const type = record.fieldsInfo[fieldName].type

    if(type === 'one2many' || type === 'many2many') {
      if(!data[fieldName]) continue
      commands[fieldName] = []
      let list = localData[data[fieldName]]
      if (options.changesOnly && (!list._changes || !(list._changes as any).length)) {
        continue;
      }

      const oldResIDs = list.res_ids.slice(0)
      const relRecordAdded = [] as any[]
      const relRecordUpdated = [] as any[]
      _.each(list._changes, function (change: any) {
          if (change.operation === 'ADD' && change.id) {
              relRecordAdded.push(localData[change.id])
          } else if (change.operation === 'UPDATE' && !isNew(change.id)) {
              relRecordUpdated.push(localData[change.id])
          }
      })

      list = _applyX2ManyOperations(list)

      if(type === 'one2many') {
        const removedIds = _.difference(oldResIDs, list.res_ids);
        const addedIds = _.difference(list.res_ids, oldResIDs);
        const keptIds = _.intersection(oldResIDs, list.res_ids);

        let changes, command, relRecord
        for (var i = 0; i < list.res_ids.length; i++) {
          // update command
          if (keptIds.includes(list.res_ids[i])) {
            relRecord = _.find(relRecordUpdated, {res_id: list.res_ids[i]})
            changes = relRecord ? _generateChanges(relRecord, options) : {}
            if(!_.isEmpty(changes)) {
              command = x2ManyCommands.update(relRecord.res_id, changes)
              commands[fieldName].push(command)
            }
          } else if(addedIds.includes(list.res_ids[i])) {
            // add command
            relRecord = _.find(relRecordAdded, {res_id: list.res_ids[i]})
            if(!relRecord) {
              //TODO
            }
            changes = _generateChanges(relRecord, _.extend({}, options, {changesOnly: true}))
            if(isNew(relRecord.id)) {
              commands[fieldName].push(x2ManyCommands.create(relRecord.res_id, changes))
            } else {
              // TODO
            }
          }
        }

        // delete command 
        for (i = 0; i < removedIds.length; i++) { 
          commands[fieldName].push(x2ManyCommands.delete(removedIds[i]))
        }
      }
    }
  }

  return commands
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
const _fetchX2Manys = (record: DataPoint) => {
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
        fieldsInfo,
        parentId: record.id
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
        list._cache[id] = dataPoint.id
        list.data.push(dataPoint.id)
      }
    })
  }
  return res.data
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

/**
 * 解析表体的默认值
 * @param record 
 * @param fieldName 
 * @param commands 
 */
const _processX2ManyCommands = (record: DataPoint, fieldName: string, commands: any) => {
  const field = record.fieldsInfo[fieldName]
  const fieldsInfo = field && field.list || {}
  const viewType = record.viewType

  const list = _makeDataPoint({
    type: 'list',
    viewType: viewType,
    modelName: field.relation as string,
    parentId: record.id,
    fieldsInfo,
    res_ids: []
  });
  record._changes[fieldName] = list.id

  list._changes = []
  commands = commands || []
  _.each(commands, (value: any) => {
    if(value[0] === 0) {
      const r = _makeDataPoint({
        viewType,
        modelName: list.model,
        fieldsInfo: fieldsInfo,
        parentId: list.id
      });

      list._changes.push({operation: 'ADD', id: r.id})

      _.each(_getFieldsName(r), (fieldName) => {
        r.data[fieldName] = null
      })

      r._changes = _.defaults(value[2], r.data)
      for(let fieldName in r._changes) {
        if(!(fieldName in r._changes)) continue

        if(fieldName in r.fieldsInfo) {
          const field = r.fieldsInfo[fieldName]
          const fieldType = field.type
          let rec 
          if(fieldType === 'many2one') {
            rec = _makeDataPoint({
              viewType,
              modelName: field.relation as string,
              fieldsInfo: {
                id: { type: 'integer', name: 'id'},
                display_name: { type: 'char', name: 'display_name'} 
              },
              data: { id: r._changes[fieldName] },
              parentId: r.id
            })
            r._changes[fieldName] = rec.id
          } else if(fieldType === 'reference') {
            // TODO
          } else if(['one2many', 'many2many'].includes(fieldType)) {
            const x2mCommands = value[2][fieldName]
            _processX2ManyCommands(r, fieldName, x2mCommands)
          } else {
            r._changes[fieldName] = _parseServerValue(field, r._changes[fieldName])
          }
        }
      }
    }
  })

  // TODO fetch m2o display_name
}

/**
 * 表体根据res_ids重新计算data
 * @param list 
 */
const _setDataInRange = (list: DataPoint) => {
  list.data = []
  _.each(list.res_ids, (id: any) => {
    if(list._cache[id]) {
      list.data.push(list._cache[id])
    }
  })
}

/**
 * 遍历所有localData执行给定方法
 * @param element 
 * @param fn 
 */
const _visitChildren = (element: DataPoint, fn: (el: DataPoint) => void) => {
  fn(element)
  if(element.type === 'record') {
    for(let fieldName in element.data) {
      const field = element.fieldsInfo[fieldName]
      if(!field) continue

      if(['one2many', 'many2many', 'many2one'].includes(field.type)) {
        const hasChange = element._changes && fieldName in element._changes
        const value = hasChange ? (element._changes as any)[fieldName] : element.data[fieldName]
        const relElement = localData[value]
        relElement && _visitChildren(relElement, fn)
      }
    }
  }

  if(element.type === 'list') {
    element = _applyX2ManyOperations(element)
    _.each(element.data, (id: DataPointId) => {
      const elem = localData[id]
      _visitChildren(elem, fn)
    })
  }
}


// ------  public  ------------

export let localData: LocalData = {}
export const recordMap = new Map<string, DataPointId>()
export let rootID: DataPointId

/**
 * 默认值处理
 * @param recordID 
 * @param values 
 * @param options 
 */
export const applyDefaultValues = (recordID: DataPointId, values: any, options: any) => {
  options = options || {}
  const record = localData[recordID]
  const viewType = record.viewType || options.viewType
  const fieldNames = options.fieldNames
  let fieldName, field
  record._changes = record._changes || {}

  values = _.pick(values, fieldNames)

  // 空值
  for (var i = 0; i < fieldNames.length; i++) {
    fieldName = fieldNames[i];
    if (!(fieldName in values) && !(fieldName in record._changes)) {
      field = record.fieldsInfo[fieldName];
      if (field.type === 'float' || field.type === 'integer' ) {
        values[fieldName] = 0;
      } else if (field.type === 'one2many' || field.type === 'many2many') {
        values[fieldName] = [];
      } else {
        values[fieldName] = null;
      }
    }
  }

  for(let fieldName in values) {
    field = record.fieldsInfo[fieldName]
    record.data[fieldName] = null

    if(field.type === 'many2one' && values[fieldName]) {
      const r = _makeDataPoint({
        modelName: field.relation as string,
        data: { id: values[fieldName] },
        fieldsInfo: {
          id: { type: 'integer', name: 'id'},
          display_name: { type: 'char', name: 'display_name'} 
        },
        parentId: record.id,
        viewType: viewType
      });
      (record._changes as any)[fieldName] = r.id
    } else if(field.type === 'reference' && values[fieldName]) {
      // TODO
    } else if(field.type === 'one2many' || field.type === 'many2many') {
      _processX2ManyCommands(record, fieldName, values[fieldName])
    } else {
      (record._changes as any)[fieldName] = _parseServerValue(field, values[fieldName])
    }
  }
}

/**
 * 表单数据加载入口, 只会调用一次
 * @param params 
 */
export const load = async (params: LoadParams): Promise<DataPointId> => {
  _.each(_.keys(localData), (key: string) => {
    _.unset(localData, key)
  })

  if(params.type === 'record' && !params.res_id) {
    // create
    rootID = await _makeDefaultRecord(params.modelName, params)
  } else {
    const dataPoint = _makeDataPoint(params)
    await _load(dataPoint)
    rootID = dataPoint.id
  }
  
  return rootID
}

/**
 * 放弃所有改动
 * @param id 
 */
export const discardChanges = (id: DataPointId) => {
  const element = localData[id]
  _visitChildren(element, (elem: DataPoint) => {
    elem._changes = null
    elem._isDirty = false
  })
}

/**
 * 判断表单是否有改动
 * @param id 
 */
export const isDirty = (id: DataPointId) => {
  let isDirty = false
  _visitChildren(localData[id], (r: DataPoint) => {
    if(r._isDirty) {
      isDirty = true
    }
  })
  return isDirty
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

  let element = localData[id]
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

  element = _applyX2ManyOperations(element)
  //TODO sort list?
  _setDataInRange(element)

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
export const notifyChanges = async (recordID: DataPointId, changes: DataPointData) => {
  const record = localData[recordID]
  const parentRecord = record.parentId && localData[record.parentId]

  if(parentRecord && parentRecord.type === 'list') {
    // x2many changes 子视图字段修改
    let x2manyCommad = JSON.parse(sessionStorage.getItem(sessionStorageKeys.x2manyCommand) || '{}')
    if(x2manyCommad && x2manyCommad.type === 'UPDATE') {
      changes = {
        [x2manyCommad.fieldName]: {
          operation: x2manyCommad.type,
          id: recordID,
          data: changes
        }
      }
      recordID = x2manyCommad.recordID as DataPointId
    }
  }
  
  await _applyChange(recordID, changes)
}

/**
 * 查找dataPoint
 * @param props 
 */
export const findDataPoint = (props: DataPointId | any) => {
  if(typeof props === 'string') {
    return localData[props]
  } else {
    return _.find(_.values(localData), props)
  }
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
    record._isDirty = false
    record._changes = {} 

    if(res.ret === 0) {
      // 移除其他DataPoint
      _.each(_.keys(localData), (key: string) => {
        key !== record.id && _.unset(localData, key)
      })
  
      // reload data
      if(isNew(record.id)) {
        record.res_id = res.data
      }
      await _fetchRecord(record)
    }

    return res
  }

  return true
}