/**
 * 表单记录的相关操作
 * like odoo basic_model
 */

import {
  each,
  without,
  pick,
  find,
  reject,
  map,
  uniq,
  flatten,
  values,
  groupBy,
  uniqueId,
  difference,
  intersection,
  isEmpty,
  filter,
  defaults
} from 'lodash-es'
import { FieldsInfo } from '@/logics/types'
import {
  LoadParams,
  LocalData,
  DataPointId,
  DataPoint,
  DataPointData,
  DataPointState
} from '@/logics/types/dataPoint'
import fieldUtils from '@/logics/core/fieldUtils'
import { str2Date, formatDate } from '@/utils/date'
import {
  fetchRecord,
  saveRecord,
  fetchDefaultValues,
  fetchNameGet,
  fetchOnChange
} from '@/api/record'
import { sessionStorageKeys } from '@/logics/enums/cache'
import Domain from '@/logics/odoo/Domain'
import Context from '../odoo/Context'

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
  },
  // (3, id[, _]) removes relation, but not linked record itself
  FORGET: 3,
  forget: function (id: string | number) {
    return [x2ManyCommands.FORGET, id, false]
  },
  LINK_TO: 4,
  link_to: function (id: string | number) {
    return [x2ManyCommands.LINK_TO, id, false]
  },
  // (5[, _[, _]])
  DELETE_ALL: 5,
  delete_all: function () {
    return [5, false, false]
  },
  // (6, _, ids) replaces all linked records with provided ids
  REPLACE_WITH: 6,
  replace_with: function (ids: any[]) {
    return [6, false, ids]
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
  const record = localData[recordID]
  list._changes.push({ operation: 'ADD', id: recordID, isNew: true, position: options.position })
  list._cache[record.res_id as any] = recordID

  return recordID
}

/**
 * 根据changes计算最新的res_ids
 * @param list
 */
const _applyX2ManyOperations = (list: DataPoint) => {
  list = Object.assign({}, list)
  list.res_ids = list.res_ids.slice(0)
  const changes = list._changes || []
  each(changes, (change: any) => {
    let relRecord
    if (change.id) {
      relRecord = localData[change.id]
    }

    switch (change.operation) {
      case 'ADD':
        const resID = relRecord ? relRecord.res_id : change.resID
        if (typeof change.position === 'number') {
          // insert line
          list.res_ids.splice(change.position, 0, resID)
        } else {
          list.res_ids.push(resID)
        }
        break
      case 'FORGET':
      case 'DELETE':
        const deletedResID = relRecord ? relRecord.res_id : change.id
        list.res_ids = without(list.res_ids, deletedResID) as string[]
        break
      case 'REMOVE_ALL':
        list.res_ids = []
        break
      case 'UPDATE':
        break
    }
  })

  _setDataInRange(list) // update list.data by res_ids
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
  for (let fieldName in changes) {
    const field = record.fieldsInfo[fieldName]
    if (field && (field.type === 'one2many' || field.type === 'many2many')) {
      defs.push(_applyX2ManyChange(record, fieldName, changes[fieldName]))
    } else if (field && (field.type === 'many2one' || field.type === 'reference')) {
      _applyX2OneChange(record, fieldName, changes[fieldName])
    } else {
      record._changes[fieldName] = changes[fieldName]
    }
  }

  return Promise.all(defs).then(() => {
    const onChangeFields = [] as string[]
    for (let fieldName in changes) {
      const field = record.fieldsInfo[fieldName]
      if (field && field.onChange) {
        const isX2Many = field.type === 'one2many' || field.type === 'many2many'
        if (!isX2Many) {
          onChangeFields.push(fieldName)
        }
      }
    }

    return new Promise(resolve => {
      if (onChangeFields.length) {
        _performOnChange(record, onChangeFields).then((result: any) => {
          resolve(Object.keys(changes).concat(Object.keys((result && result.value) || {})))
        })
      } else {
        resolve(Object.keys(changes))
      }
    })
  })
}

/**
 * 值控制返回结果处理
 * @param values
 * @param record
 */
const _applyOnChange = (values: any, record: DataPoint) => {
  const defs = [] as any[]
  let rec
  record._changes = record._changes || {}
  each(values, (val: any, name: string) => {
    const field = record.fieldsInfo[name]
    if (!field) return

    let oldValue = name in record._changes ? record._changes[name] : record.data[name]
    let id

    if (field.type === 'many2one') {
      id = false
      if (val) {
        var data = Array.isArray(val) ? { id: val[0], display_name: val[1] } : { id: val }
        if (!oldValue || localData[oldValue].res_id !== data.id) {
          // only register a change if the value has changed
          rec = _makeDataPoint({
            data: data,
            modelName: field.relation as string,
            parentId: record.id,
            fieldsInfo: {
              id: { type: 'integer', name: 'id' },
              display_name: { type: 'char', name: 'display_name' }
            },
            viewType: 'form'
          })
          id = rec.id
          record._changes[name] = id
        }
      } else {
        record._changes[name] = false
      }
    } else if (field.type === 'reference') {
      id = false
      if (val) {
        var ref = val.split(',')
        var modelName = ref[0]
        var resID = parseInt(ref[1])
        if (
          !oldValue ||
          localData[oldValue].res_id !== resID ||
          localData[oldValue].model !== modelName
        ) {
          // only register a change if the value has changed
          rec = _makeDataPoint({
            data: { id: parseInt(ref[1]) },
            modelName: modelName,
            parentId: record.id,
            fieldsInfo: {
              id: { type: 'integer', name: 'id' },
              display_name: { type: 'char', name: 'display_name' }
            },
            viewType: 'form'
          })
          defs.push(_fetchNameGet(rec))
          id = rec.id
          record._changes[name] = id
        }
      } else {
        record._changes[name] = false
      }
    } else if (field.type === 'one2many' || field.type === 'many2many') {
      let listId = record._changes[name] || record.data[name]
      let list: DataPoint

      if (listId) {
        list = localData[listId]
      } else {
        list = _makeDataPoint({
          type: 'list',
          viewType: 'list',
          modelName: field.relation as string,
          parentId: record.id,
          fieldsInfo: field.list || {}
        })
      }
      record._changes[name] = list.id
      list._changes = list._changes || []

      let oldChanges = list._changes
      each(val, (command: any[]) => {
        let rec, recID
        if (command[0] === 0 || command[0] === 1) {
          // CREATE or UPDATE
          if (command[0] === 0 && command[1]) {
            const previousChange = find(oldChanges, (operation: any) => {
              const child = localData[operation.id]
              return child && child.res_id === command[1]
            })
            recID = previousChange && previousChange.id
            rec = localData[recID]
          }
          if (command[0] === 1 && command[1]) {
            rec = localData[list._cache[command[1]]]
          }
          if (!rec) {
            const params: LoadParams = {
              type: 'record',
              viewType: 'list',
              fieldsInfo: list.fieldsInfo,
              modelName: list.model,
              parentId: list.id
            }
            if (command[0] === 1) {
              params.res_id = command[1]
            }
            rec = _makeDataPoint(params)
            rec.res_id && (list._cache[rec.res_id] = rec.id)
          }
          list._changes.push({ operation: 'ADD', id: rec.id })
          if (command[0] === 1) {
            list._changes.push({ operation: 'UPDATE', id: rec.id })
          }
          defs.push(_applyOnChange(command[2], rec))
        } else if (command[0] === 4) {
          // LINK TO
          linkRecord(list, command[1])
        } else if (command[0] === 5) {
          // DELETE ALL
          list._changes = [{ operation: 'REMOVE_ALL' }]
        } else if (command[0] === 6) {
          list._changes = [{ operation: 'REMOVE_ALL' }]
          each(command[2], function (resID) {
            linkRecord(list, resID)
          })
        }
      })

      list = _applyX2ManyOperations(list)
      defs.push(
        _fetchX2ManysData(list).then(() => {
          return Promise.all([_fetchX2ManysBatched(list), _fetchReferencesBatched(list)])
        })
      )
    } else {
      const newValue = _parseServerValue(field, val)
      if (newValue !== oldValue) {
        record._changes[name] = newValue
      }
    }
  })

  return Promise.all(defs)

  function linkRecord(list: DataPoint, resID: number) {
    rec = localData[list._cache[resID]]
    if (rec) {
      discardChanges(rec.id)
    }

    list._changes.push({
      operation: 'ADD',
      id: rec ? rec.id : null,
      resID: resID
    })
  }
}

/**
 * many2one 值更新处理
 * @param record
 * @param fieldName
 * @param data
 */
const _applyX2OneChange = (record: DataPoint, fieldName: string, data: any) => {
  if (!data || !data.id) {
    ;(record._changes as any)[fieldName] = false
    return
  }

  let relatedID
  if (record._changes && fieldName in record._changes) {
    relatedID = record._changes[fieldName]
  } else {
    relatedID = record.data[fieldName]
  }

  const relatedRecord = localData[relatedID]
  if (
    relatedRecord &&
    data.id === localData[relatedID].res_id &&
    (!data.model || data.model === relatedRecord.model)
  ) {
    return
  }

  const relData = pick(data, 'id', 'display_name')
  const field = record.fieldsInfo[fieldName]
  const coModel = field.type === 'reference' ? data.model : field.relation
  // TODO fetch name_get

  const rec = _makeDataPoint({
    data: relData,
    fieldsInfo: {},
    modelName: coModel,
    parentId: record.id,
    res_id: data.id,
    viewType: 'form'
  })

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
  let list = localData[localID]
  list._changes = list._changes || []
  const defs = []

  switch (command.operation) {
    case 'CREATE':
      defs.push(_addX2ManyDefaultRecord(list, { position: command.position }))
      break
    case 'UPDATE':
      !find(list._changes as any[], { operation: 'UPDATE', id: command.id }) &&
        (list._changes as any[]).push({ operation: 'UPDATE', id: command.id })
      if (command.data) {
        defs.push(_applyChange(command.id, command.data))
      }
      break
    case 'FORGET':
      list._forceM2MUnlink = true
    // no-fallthrough
    case 'DELETE':
      let idsToRemove = command.ids
      list._changes = reject(list._changes, function (change: any) {
        var idInCommands = command.ids.includes(change.id)
        if (idInCommands && change.operation === 'ADD') {
          idsToRemove = without(idsToRemove, change.id)
        }
        return idInCommands
      })
      each(idsToRemove, function (id: string) {
        var operation = list._forceM2MUnlink ? 'FORGET' : 'DELETE'
        list._changes.push({ operation: operation, id: id })
      })
      break
    case 'COPY_O2M':
      defs.push(copyLine(list, command.id))
      break
    case 'ADD_M2M':
      list._forceM2MLink = true
      const data = Array.isArray(command.ids) ? command.ids : [command.ids]
      each(data, (d: any) => {
        const rec = _makeDataPoint({
          modelName: list.model,
          fieldsInfo: {
            id: { type: 'integer', name: 'id' },
            display_name: { type: 'char', name: 'display_name' }
          },
          viewType: 'form',
          parentId: list.id,
          data: d,
          res_id: d.id
        })
        list._cache[rec.res_id as number] = rec.id
        list._changes.push({ operation: 'ADD', id: rec.id })
      })
      break
  }

  return Promise.all(defs)
}

/**
 * onchange的参数
 * @param record
 */
const _buildOnchangeSpecs = (record: DataPoint) => {
  let hasOnchange = false
  const specs = {} as any
  const fieldsInfo = record.fieldsInfo
  generateSpecs(fieldsInfo)

  function generateSpecs(fieldsInfo: FieldsInfo, prefix?: string) {
    prefix = prefix || ''
    each(Object.keys(fieldsInfo), function (name) {
      const field = fieldsInfo[name]
      const key = prefix + name
      specs[key] = field.onChange ? '1' : ''
      if (field.onChange) {
        hasOnchange = true
      }
      if (field.type === 'one2many' || field.type === 'many2many') {
        // TODO 联动视图
        generateSpecs((field.list || {}) as FieldsInfo, key + '.')
      }
    })
  }
  return hasOnchange ? specs : false
}

/**
 * 表体字段的复制
 * @param recordID
 * @param defaultTemplate
 */
const _copyX2ManyRecord = async (recordID: DataPointId, defaultTemplate: any) => {
  const list = localData[recordID]
  const listState = get(recordID)
  const resIdMap = {} as any

  // TODO o2m in list fields
  list._changes = []
  list._cache = {}
  list.res_ids = []

  await _getX2ManyDefaultData(list, defaultTemplate)
  // TODO o2m in list fields default values
  await Promise.all(
    map(listState.data, async (record: DataPoint) => {
      list._changes.push({ operation: 'ADD', id: record.id, isNew: true })
      await copyRecord(record.id, defaultTemplate)
      const { res_id, id } = localData[record.id]
      resIdMap[id] = res_id
      record._isDirty = true
    })
  )

  each(list._changes, ({ id }: any) => {
    const res_id = resIdMap[id]
    res_id && (list._cache[res_id] = id)
  })

  return list
}

/**
 * 解析modifiers
 * @param element
 * @param modifiers
 */
const _evalModifiers = (element: DataPoint, modifiers: any) => {
  const result = {} as any
  let evalContext: any
  const evalModifier = (mod: any) => {
    if (mod === undefined || mod === false || mod === true) {
      return !!mod
    }
    evalContext = evalContext || _getEvalContext(element)
    return (new Domain(mod, evalContext) as any).compute(evalContext)
  }

  if ('invisible' in modifiers) {
    result.invisible = evalModifier(modifiers.invisible)
  }
  if ('columnInvisible' in modifiers) {
    result.column_invisible = evalModifier(modifiers.columnInvisible)
  }
  if ('readonly' in modifiers) {
    result.readonly = evalModifier(modifiers.readonly)
  }
  if ('required' in modifiers) {
    result.required = evalModifier(modifiers.required)
  }
  return result
}

/**
 * 请求表单数据
 * @param record
 */
const _fetchRecord = async (record: DataPoint) => {
  const { model, res_id } = record
  const fieldNames = _getFieldsName(record)
  const res = await fetchRecord(model, res_id as number, fieldNames)
  if (res.ret === 0) {
    const recordData = res.data
    if (recordData.odoo_data.length) {
      Object.assign(record, {
        data: recordData.odoo_data[0],
        creator: {
          ...recordData.create_user,
          date: str2Date(res.data.create_date || '')
        },
        ...pick(recordData, ['state', 'state_name'])
      })
      _parseServerData(record)
      await Promise.all([_fetchX2Manys(record), _fetchReferences(record)])
    }
  }
}

/**
 * @param group
 */
const _fetchMany2OneGroup = async (group: any[]) => {
  const ids = uniq(map(map(group, 'record'), 'res_id'))
  const res = await fetchNameGet(group[0].record.model, ids)
  if (res.ret === 0) {
    each(group, (obj: any) => {
      const nameGet = find(res.data, function (n) {
        return n[0] === obj.record.res_id
      })
      obj.record.data.display_name = nameGet[1]
    })
  }
  return true
}

/**
 * name_get
 * @param record
 */
const _fetchNameGet = async (record: DataPoint) => {
  const res = await fetchNameGet(record.model, record.res_id as number)
  if (res.ret === 0) {
    ;(record.data as any).display_name = (res.data as any)[0][1]
  }
}

/**
 * 批量name_get
 * @param list
 * @param fieldName
 */
const _fetchNameGets = async (list: DataPoint, fieldName: string) => {
  let model = list.fieldsInfo[fieldName].relation
  const records = [] as any[]
  const ids = [] as any[]
  list = _applyX2ManyOperations(list)

  each(list.data, (localId: string) => {
    const record = localData[localId]
    const data = record._changes || record.data
    const m2oId = data[fieldName]
    if (!m2oId) return

    const m2oRecord = localData[m2oId]
    records.push(m2oRecord)
    ids.push(m2oRecord.res_id)
    model = m2oRecord.model
  })

  if (!ids.length) return

  const res = await fetchNameGet(model as string, ids)
  if (res.ret === 0) {
    each(records, (record: DataPoint) => {
      const nameGet = find(res.data, (n: any) => n[0] === record.data.id)
      record.data.display_name = nameGet[1]
    })
  }
}

/**
 * 构造表体的dataPoint
 * @param record
 */
const _fetchX2Manys = (record: DataPoint) => {
  const fieldsInfo = record.fieldsInfo
  const defs = [] as any[]
  each(fieldsInfo, (field: any, fieldName: string) => {
    if (field.type === 'one2many' || field.type === 'many2many') {
      const ids = record.data[fieldName] || []
      const fieldInfo = record.fieldsInfo[fieldName]
      const fieldsInfo = fieldInfo.list || fieldInfo.relatedFields || {}
      // TODO 暂不考虑表体是联动视图的情况
      const list = _makeDataPoint({
        type: 'list',
        viewType: 'list',
        modelName: field.relation,
        res_ids: ids,
        fieldsInfo,
        parentId: record.id,
        relationField: fieldInfo.relationField
      })
      record.data[fieldName] = list.id
      if (!fieldInfo.__no_fetch) {
        defs.push(
          _fetchX2ManysData(list).then(() => {
            return Promise.all([_fetchX2ManysBatched(list), _fetchReferencesBatched(list)])
          })
        )
      }
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
  const fieldNames = _getFieldsName(list)
  if (res_ids.length && fieldNames.length) {
    const res = await fetchRecord(model, res_ids as number[], fieldNames)
    if (res.ret === 0) {
      const records = res.data
      each(res_ids, (id: any) => {
        const data = find(records, { id })
        if (data) {
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
  }
  return list
}

/**
 * 新建reference的record
 * @param record
 * @param fieldName
 */
const _fetchReference = async (
  record: DataPoint,
  fieldName: string
): Promise<DataPoint | undefined> => {
  const value = (record._changes && record._changes[fieldName]) || record.data[fieldName]
  const model = value && value.split(',')[0]
  const resID = value && parseInt(value.split(',')[1])
  if (model && model !== 'False' && resID) {
    const res = await fetchNameGet(model, +resID)
    if (res.ret === 0 && res.data?.length) {
      const result = res.data
      return _makeDataPoint({
        data: {
          id: result[0][0],
          display_name: result[0][1]
        },
        fieldsInfo: {
          id: { type: 'integer', name: 'id' },
          display_name: { type: 'char', name: 'display_name' }
        },
        parentId: record.id,
        modelName: model,
        viewType: 'form'
      })
    }
  }
}

/**
 * 获取reference数据
 * @param record
 */
const _fetchReferences = async (record: DataPoint) => {
  const fieldsInfo = record.fieldsInfo
  const defs = [] as any[]
  each(fieldsInfo, (field: any, fieldName: string) => {
    if (field.type === 'reference') {
      const def = _fetchReference(record, fieldName).then((dataPoint?: DataPoint) => {
        dataPoint && (record.data[fieldName] = dataPoint.id)
      })
      defs.push(def)
    }
  })
  return Promise.all(defs)
}

/**
 * @param datapoints
 * @param model
 * @param fieldName
 */
const _fetchReferenceData = async (
  datapoints: Record<string, DataPointId[]>,
  model: string,
  fieldName: string
) => {
  const ids = map(Object.keys(datapoints), (id: string) => parseInt(id))
  const res = await fetchNameGet(model, ids)
  if (res.ret === 0) {
    each(res.data, (value: any) => {
      const recordIds = datapoints[value[0]]
      each(recordIds, (recordId: string) => {
        const record = localData[recordId]
        const referenceDp = _makeDataPoint({
          data: {
            id: value[0],
            display_name: value[1]
          },
          fieldsInfo: {
            id: { type: 'integer', name: 'id' },
            display_name: { type: 'char', name: 'display_name' }
          },
          parentId: recordId,
          modelName: model,
          viewType: 'form'
        })
        record.data[fieldName] = referenceDp.id
      })
    })
  }
  return true
}

/**
 * @param list
 * @param fieldName
 */
const _fetchReferenceBatched = (list: DataPoint, fieldName: string) => {
  list = _applyX2ManyOperations(list)

  const toFetch = _getDataToFetchByModel(list, fieldName)
  const defs = [] as any
  // one name_get by model
  each(toFetch, (datapoints, model) => {
    defs.push(_fetchReferenceData(datapoints, model, fieldName))
  })

  return Promise.all(defs)
}

/**
 * 批量获取表体中的reference字段值
 * @param list
 */
const _fetchReferencesBatched = (list: DataPoint) => {
  const defs = [] as any
  const fieldNames = _getFieldsName(list)
  fieldNames.forEach((fieldName: string) => {
    const field = list.fieldsInfo[fieldName]
    if (field && field.type === 'reference') {
      defs.push(_fetchReferenceBatched(list, fieldName))
    }
  })
  return Promise.all(defs)
}

/**
 * 获取表体的x2m字段数据
 * @param list
 * @param toFetch
 * @param fieldName
 */
const _fetchRelatedData = async (
  list: DataPoint,
  toFetch: Record<number, DataPoint[]>,
  fieldName: string
) => {
  const ids = Object.keys(toFetch).map((id: string) => +id)
  const field = list.fieldsInfo[fieldName]
  if (!ids.length || !field || field.__no_fetch) {
    return Promise.resolve()
  }

  // TODO 这里暂时只考虑m2m字段， 所以只查询display_name
  const res = await fetchRecord(field.relation as string, ids, ['display_name'])
  if (res.ret === 0) {
    const records = uniq(flatten(values(toFetch)))
    _updateRecordsData(records, fieldName, res.data)
  }
  return res
}

/**
 * 批量处理记录的m2o字段的显示名
 * @param record
 */
const _fetchRelationalData = (record: DataPoint) => {
  const toBeFetched: any = []

  each(_getFieldsName(record), (fieldName: string) => {
    const field = record.fieldsInfo[fieldName]
    if (field && field.type === 'many2one' && !field.__no_fetch) {
      const localId = (record._changes && record._changes[fieldName]) || record.data[fieldName]
      const relatedRecord = localData[localId]
      if (!relatedRecord || relatedRecord.data.display_name) {
        return
      }
      // TODO context
      toBeFetched.push({
        context: {},
        record: relatedRecord
      })
    }
  })

  const groups = groupBy(toBeFetched, (elem: any) =>
    [elem.record.model, JSON.stringify(elem.context)].join()
  )
  return Promise.all(map(groups, _fetchMany2OneGroup))
}

/**
 * 获取表体上的x2many字段数据
 * @param list
 * @param fieldName
 */
const _fetchX2ManyBatched = (list: DataPoint, fieldName: string) => {
  list = _applyX2ManyOperations(list)
  // sort list?

  const toFetch = _getDataToFetch(list, fieldName)
  return _fetchRelatedData(list, toFetch, fieldName)
}

/**
 * 批量获取表体上的x2many字段数据
 * @param list
 */
const _fetchX2ManysBatched = (list: DataPoint) => {
  const defs = [] as any
  const fieldNames = _getFieldsName(list)
  fieldNames.forEach((fieldName: string) => {
    const field = list.fieldsInfo[fieldName]
    if (field && (field.type === 'many2many' || field.type === 'one2many')) {
      defs.push(_fetchX2ManyBatched(list, fieldName))
    }
  })
  return Promise.all(defs)
}

/**
 * 增加新的data point数据
 * @param params
 */
const _makeDataPoint = <T extends LoadParams>(params: T): DataPoint => {
  let res_id,
    type = params.type || 'record'
  let res_ids = params.res_ids || []
  const data = params.data || (type === 'record' ? {} : [])
  if (type === 'record') {
    res_id = params.res_id || params.data?.id
    if (res_id) {
      ;(data as any).id = res_id
    } else {
      res_id = uniqueId('virtual_')
    }
  }

  const dataPoint: DataPoint = {
    _cache: type === 'list' ? {} : undefined,
    _changes: null,
    _domains: {},
    id: uniqueId(params.modelName + '_'),
    model: params.modelName,
    viewType: params.viewType,
    fieldsInfo: params.fieldsInfo,
    parentId: params.parentId,
    domain: params.domain || [],
    type,
    data,
    res_id,
    res_ids
  }

  params.relationField && (dataPoint.relationField = params.relationField)

  localData[dataPoint.id] = dataPoint
  if (dataPoint.type === 'record') {
    recordMap && recordMap.set(`${dataPoint.model}_${res_id}`, dataPoint.id)
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
  if (res.ret === 0) {
    await applyDefaultValues(record.id, res.data, { fieldNames })
    await _performOnChange(record, without(fieldNames, '__last_update'), { from: 'create' })
    await _fetchRelationalData(record)
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

// onchange context
const _getContext = (element: DataPoint, options?: any) => {
  options = options || {}
  const context = new Context({})
  context.set_eval_context(_getEvalContext(element))

  if (options.full || !(options.fieldName || options.additionalContext)) {
    context.add(element.context || {})
  }

  if (options.fieldName) {
    const fieldInfo = element.fieldsInfo[options.fieldName]
    if ('context' in fieldInfo) {
      context.add((fieldInfo as any).context)
    }
  }
  if (options.additionalContext) {
    context.add(options.additionalContext)
  }

  if (element.rawContext) {
    // TODO
  }

  return context.eval()
}

/**
 * 创建一条默认的record
 * @param record
 */
const _getDefaultData = async (record: DataPoint) => {
  const recordId = await _makeDefaultRecord(record.model, {
    fieldsInfo: record.fieldsInfo,
    viewType: record.viewType,
    modelName: record.model
  })

  const defaultRecord = localData[recordId]
  delete localData[recordId]

  return defaultRecord
}

/**
 * @param list
 * @param fieldName
 */
const _getDataToFetch = (list: DataPoint, fieldName: string) => {
  const toFetch = {} as any
  const fieldsInfo = list.fieldsInfo
  const field = fieldsInfo[fieldName]

  let recordIds = list.data
  recordIds.forEach((recordId: string) => {
    const record = localData[recordId]
    if (typeof record.data[fieldName] === 'string') return

    each(record.data[fieldName], (id: number) => {
      toFetch[id] = toFetch[id] || []
      toFetch[id].push(record)
    })

    const m2mList = _makeDataPoint({
      type: 'list',
      modelName: field.relation as string,
      parentId: list.id,
      fieldsInfo: _getFieldsInfo(),
      viewType: 'list',
      res_ids: record.data[fieldName]
    })
    record.data[fieldName] = m2mList.id
  })
  return toFetch
}

/**
 * ref数据批量获取预整理
 * @param list
 * @param fieldName
 */
const _getDataToFetchByModel = (list: DataPoint, fieldName: string) => {
  const toFetch = {} as any
  each(list.data, (recordId: DataPointId) => {
    const record = localData[recordId]
    const value = record.data[fieldName]
    // 过滤已经获取数据的ref字段
    if (value && !localData[value]) {
      const [model, resID] = value.split(',')
      if (!(model in toFetch)) {
        toFetch[model] = {} as any
      }

      if (toFetch[model][resID]) {
        toFetch[model][resID].push(recordId)
      } else {
        toFetch[model][resID] = [recordId]
      }
    }
  })
  return toFetch
}

/**
 * 获取fieldsInfo
 * @param element
 */
const _getFieldsInfo = (element?: DataPoint) => {
  return element
    ? element.fieldsInfo
    : ({
        id: { type: 'integer', name: 'id' },
        display_name: { type: 'char', name: 'display_name' }
      } as FieldsInfo)
}

/**
 * 获取o2m字段的默认值模版
 * @param list
 * @param defaultTemplate
 */
const _getX2ManyDefaultData = async (list: DataPoint, defaultTemplate: any) => {
  const model = list.model
  // default values cache
  if (defaultTemplate[model]) return defaultTemplate[model]

  const listRecord = await _getDefaultData(list)
  defaultTemplate[model] = listRecord._changes
  return listRecord
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
  if ('changesOnly' in options && !options.changesOnly) {
    changes = Object.assign({}, record.data, record._changes)
  } else {
    changes = Object.assign({}, record._changes)
  }
  // TODO get x2many commands
  const commands = _generateX2ManyCommands(record, {
    changesOnly: 'changesOnly' in options ? options.changesOnly : true
  })

  for (let fieldName in record.fieldsInfo) {
    const type = record.fieldsInfo[fieldName].type

    let value
    if (type === 'one2many' || type === 'many2many') {
      if (commands[fieldName] && commands[fieldName].length) {
        changes[fieldName] = commands[fieldName]
      } else {
        delete changes[fieldName]
      }
    } else if (type === 'many2one' && fieldName in changes) {
      value = changes[fieldName]
      changes[fieldName] = value ? localData[value].res_id : false
    } else if (type === 'reference' && fieldName in changes) {
      value = changes[fieldName]
      changes[fieldName] = value ? localData[value].model + ',' + localData[value].res_id : false
    } else if (type === 'char' && changes[fieldName] === '') {
      changes[fieldName] = false
    } else if (changes[fieldName] === null) {
      changes[fieldName] = false
    }

    // Date to UTC string
    if (['date', 'datetime'].includes(type) && changes[fieldName]) {
      const isUTC = type === 'datetime'
      const fmt = isUTC ? 'yyyy-MM-dd hh:mm:ss' : 'yyyy-MM-dd'
      changes[fieldName] = formatDate(fmt, changes[fieldName], isUTC)
    }
  }

  return changes
}

/**
 * onchange的必要参数
 * @param record
 * @param option
 */
const _generateOnChangeData = (record: DataPoint, options?: any) => {
  options = Object.assign({}, options || {}, { withReadonly: true })
  const commands = _generateX2ManyCommands(record, options)
  const data = Object.assign(get(record.id, { raw: true }).data, commands)
  for (let fieldName in data) {
    const field = record.fieldsInfo[fieldName]
    if (field && ['date', 'datetime'].includes(field.type) && data[fieldName]) {
      const isUTC = field.type === 'datetime'
      const fmt = isUTC ? 'yyyy-MM-dd hh:mm:ss' : 'yyyy-MM-dd'
      data[fieldName] = formatDate(fmt, data[fieldName], isUTC)
    }
  }
  // o2m
  if (record.parentId) {
    const parent = localData[record.parentId]
    if (parent.parentId && parent.relationField) {
      const parentRecord = localData[parent.parentId]
      data[parent.relationField] = _generateOnChangeData(parentRecord)
    }
  }
  return data
}

/**
 * 获取表体的操作命令
 * @param record
 * @param options
 */
const _generateX2ManyCommands = (record: DataPoint, options: any) => {
  options = options || {}
  const commands = {} as any
  const data = Object.assign({}, record.data, record._changes)
  for (let fieldName in record.fieldsInfo) {
    const type = record.fieldsInfo[fieldName].type

    if (type === 'one2many' || type === 'many2many') {
      if (!data[fieldName]) continue
      commands[fieldName] = []
      let list = localData[data[fieldName]]
      if (options.changesOnly && (!list._changes || !(list._changes as any).length)) {
        continue
      }

      const oldResIDs = list.res_ids.slice(0)
      const relRecordAdded = [] as any[]
      const relRecordUpdated = [] as any[]
      each(list._changes, function (change: any) {
        if (change.operation === 'ADD' && change.id) {
          relRecordAdded.push(localData[change.id])
        } else if (change.operation === 'UPDATE' && !isNew(change.id)) {
          relRecordUpdated.push(localData[change.id])
        }
      })

      list = _applyX2ManyOperations(list)
      // sort list?

      if (type === 'many2many' || list._forceM2MLink) {
        const relRecordCreated = filter(relRecordAdded, function (rec) {
          return typeof rec.res_id === 'string'
        })
        const realIDs = difference(list.res_ids, map(relRecordCreated, 'res_id'))
        // replace command
        commands[fieldName].push(x2ManyCommands.replace_with(realIDs))

        each(relRecordCreated, relRecord => {
          const changes = _generateChanges(relRecord, options)
          commands[fieldName].push(x2ManyCommands.create(relRecord.ref, changes))
        })

        each(relRecordUpdated, relRecord => {
          const changes = _generateChanges(relRecord, options)
          if (isEmpty(changes)) {
            const command = x2ManyCommands.update(relRecord.res_id, changes)
            commands[fieldName].push(command)
          }
        })
      } else if (type === 'one2many') {
        const removedIds = difference(oldResIDs, list.res_ids)
        const addedIds = difference(list.res_ids, oldResIDs)
        const keptIds = intersection(oldResIDs, list.res_ids)

        let didChange = false
        let changes, command, relRecord
        for (var i = 0; i < list.res_ids.length; i++) {
          // update command
          if (keptIds.includes(list.res_ids[i])) {
            relRecord = find(relRecordUpdated, { res_id: list.res_ids[i] })
            changes = relRecord ? _generateChanges(relRecord, options) : {}
            if (!isEmpty(changes)) {
              command = x2ManyCommands.update(relRecord.res_id, changes)
              didChange = true
            } else {
              command = x2ManyCommands.link_to(list.res_ids[i])
            }
            commands[fieldName].push(command)
          } else if (addedIds.includes(list.res_ids[i])) {
            // add command
            relRecord = find(relRecordAdded, { res_id: list.res_ids[i] })
            if (!relRecord) {
              commands[fieldName].push(x2ManyCommands.link_to(list.res_ids[i]))
              continue
            }
            changes = _generateChanges(relRecord, Object.assign({}, options, { changesOnly: true }))
            if (!isNew(relRecord.id)) {
              commands[fieldName].push(x2ManyCommands.link_to(relRecord.res_id))
              delete changes.id
              if (!isEmpty(changes)) {
                commands[fieldName].push(x2ManyCommands.update(relRecord.res_id, changes))
              }
            } else {
              commands[fieldName].push(x2ManyCommands.create(relRecord.res_id, changes))
            }
          }
        }

        if (options.changesOnly && !didChange && addedIds.length === 0 && removedIds.length === 0) {
          commands[fieldName] = []
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
 * 获取evalContext
 * @param element
 * @param forDomain
 */
const _getEvalContext = (element: DataPoint, forDomain = false) => {
  const evalContext = element.type === 'record' ? _getRecordEvalContext(element, forDomain) : {}

  if (element.parentId) {
    let parent = localData[element.parentId]
    if (parent.type === 'list' && parent.parentId) {
      parent = localData[parent.parentId]
    }
    if (parent.type === 'record') {
      evalContext.parent = _getRecordEvalContext(parent, forDomain)
    }
  }

  // TODO union session_context .ext
  return Object.assign(
    {},
    {
      active_id: evalContext.id || false,
      active_ids: evalContext.id ? [evalContext.id] : [],
      active_model: element.model,
      current_date: formatDate('yyyy-MM-dd'),
      id: evalContext.id || false
    },
    element.context || {},
    evalContext
  )
}

/**
 * 获取contenxt
 * @param record
 * @param forDomain
 */
const _getRecordEvalContext = (record: DataPoint, forDomain = false) => {
  const context = Object.assign({}, record.data, record._changes)
  let relDataPoint: any

  function generateX2ManyCommands(fieldName: string) {
    const commands = _generateX2ManyCommands(record, { fieldNames: [fieldName] })
    return commands[fieldName]
  }

  for (let fieldName in context) {
    const field = record.fieldsInfo[fieldName]
    if (context[fieldName] === null) {
      context[fieldName] = false
    }
    if (!field || field.name === 'id') {
      continue
    }

    // TODO 时间转换这里可能有问题 Date => string
    if (field.type === 'date' || field.type === 'datetime') {
      if (context[fieldName]) {
        context[fieldName] = JSON.parse(JSON.stringify(context[fieldName]))
      }
      continue
    }
    if (field.type === 'many2one') {
      relDataPoint = localData[context[fieldName]]
      context[fieldName] = relDataPoint ? relDataPoint.res_id : false
      continue
    }

    if (field.type === 'one2many' || field.type === 'many2many') {
      var ids
      if (!context[fieldName] || Array.isArray(context[fieldName])) {
        // no dataPoint created yet
        ids = context[fieldName] ? context[fieldName].slice(0) : []
      } else {
        relDataPoint = _applyX2ManyOperations(localData[context[fieldName]])
        ids = relDataPoint.res_ids.slice(0)
      }
      if (!forDomain) {
        ids.toJSON = generateX2ManyCommands.bind(null, fieldName)
      } else if (field.type === 'one2many') {
        // Ids are evaluated as a list of ids
        ids = filter(ids, function (id) {
          return typeof id !== 'string'
        })
      }
      context[fieldName] = ids
    }
  }

  return context
}

/**
 * 获取domain
 * @param element
 * @param options
 */
const _getDomain = (element: DataPoint, options: any = {}) => {
  const stringToArray = Domain.prototype.stringToArray
  if (options && options.fieldName) {
    if (element._domains[options.fieldName]) {
      return stringToArray(element._domains[options.fieldName], _getEvalContext(element, true))
    }
    const field = element.fieldsInfo[options.fieldName]
    if (field && field.domain) {
      return stringToArray(field.domain, _getEvalContext(element, true))
    }
    // TODO 解析字段模型属性上的domain
  }
  return stringToArray(element.domain, _getEvalContext(element, true))
}

/**
 * 解析接口返回的字段值
 * @param field
 * @param val
 */
const _parseServerValue = (field: any, value: any) => {
  if (field.type === 'date' || field.type === 'datetime') {
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
  each(fieldsInfo, (field: any, fieldName: string) => {
    const val = data[fieldName]
    if (field.type === 'many2one') {
      if (val !== false) {
        const r = _makeDataPoint({
          modelName: field.relation,
          data: {
            id: val[0],
            display_name: val[1]
          },
          fieldsInfo: {
            id: { type: 'integer', name: 'id' },
            display_name: { type: 'char', name: 'display_name' }
          },
          parentId: record.id,
          viewType: 'form'
        })
        data[fieldName] = r.id
      } else {
        data[fieldName] = false
      }
    } else {
      data[fieldName] = _parseServerValue(field, val)
    }
  })
}

/**
 * onchange入口
 * @param record
 * @param fields
 */
const _performOnChange = async (record: DataPoint, fields: string[] | string, options?: any) => {
  // 写死默认options
  options = {
    full: true,
    additionalContext: defaults(
      {
        isModifierValue: true,
        view_type: 'form'
      },
      options || {}
    )
  }

  const onchangeSpec = _buildOnchangeSpecs(record)
  if (!onchangeSpec) {
    return
  }

  const idList = record.data.id ? [record.data.id] : []
  if (fields.length === 1) {
    fields = fields[0]
    options.fieldName = fields
  }
  const context = _getContext(record, options)
  const currentData = _generateOnChangeData(record, { changesOnly: false })

  const res = await fetchOnChange(
    record.model,
    [idList, currentData, fields, onchangeSpec],
    context
  )
  if (!record._changes) return // discard edit
  if (res.ret === 0) {
    const result = res.data
    if (result.domain) {
      record._domains = Object.assign(result.domain || {}, record._domains)
    }

    await _applyOnChange(result.value, record)
  }
  return res
}

/**
 * 加载dataPoint数据
 * @param dataPoint
 */
const _load = async (dataPoint: DataPoint) => {
  if (dataPoint.type === 'record') {
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
  const fieldsInfo = (field && field.list) || {}
  const viewType = record.viewType
  const defs = [] as any
  const many2ones = {} as any
  let r: any

  const list = _makeDataPoint({
    type: 'list',
    viewType: 'list',
    modelName: field.relation as string,
    parentId: record.id,
    fieldsInfo,
    res_ids: [],
    relationField: field.relationField
  })
  record._changes[fieldName] = list.id
  list._changes = []
  commands = commands || []

  const isCommandList = commands.length && Array.isArray(commands[0])
  if (!isCommandList) {
    commands = [[6, false, commands]]
  }

  each(commands, (value: any) => {
    if (value[0] === 0) {
      r = _makeDataPoint({
        viewType,
        modelName: list.model,
        fieldsInfo: fieldsInfo,
        parentId: list.id
      })

      list._changes.push({ operation: 'ADD', id: r.id })

      each(_getFieldsName(r), fieldName => {
        r.data[fieldName] = null
      })

      r._changes = defaults(value[2], r.data)
      for (let fieldName in r._changes) {
        if (!(fieldName in r._changes)) continue

        if (fieldName in r.fieldsInfo) {
          const field = r.fieldsInfo[fieldName]
          const fieldType = field.type
          let rec
          if (fieldType === 'many2one') {
            rec = _makeDataPoint({
              viewType,
              modelName: field.relation as string,
              fieldsInfo: {
                id: { type: 'integer', name: 'id' },
                display_name: { type: 'char', name: 'display_name' }
              },
              data: { id: r._changes[fieldName] },
              parentId: r.id
            })
            r._changes[fieldName] = rec.id
            many2ones[fieldName] = true
          } else if (fieldType === 'reference') {
            const ref = r._changes[fieldName].split(',')
            rec = _makeDataPoint({
              viewType,
              modelName: ref[0],
              fieldsInfo: {
                id: { type: 'integer', name: 'id' },
                display_name: { type: 'char', name: 'display_name' }
              },
              data: { id: ref[1] },
              parentId: r.id
            })
            r._changes[fieldName] = rec.id
            many2ones[fieldName] = true
          } else if (['one2many', 'many2many'].includes(fieldType)) {
            const x2mCommands = value[2][fieldName]
            defs.push(_processX2ManyCommands(r, fieldName, x2mCommands))
          } else {
            r._changes[fieldName] = _parseServerValue(field, r._changes[fieldName])
          }
        }
      }
    }

    if (value[0] === 6) {
      // REPLACE_WITH
      each(value[2], function (res_id) {
        list._changes.push({ operation: 'ADD', resID: res_id })
      })

      defs.push(
        _fetchX2ManysData(list).then(() => {
          return Promise.all([_fetchX2ManysBatched(list), _fetchReferencesBatched(list)])
        })
      )
    }
  })

  // fetch m2o display_name
  each(Object.keys(many2ones), (name: string) => {
    defs.push(_fetchNameGets(list, name))
  })

  return Promise.all(defs)
}

/**
 * 表体根据res_ids重新计算data
 * @param list
 */
const _setDataInRange = (list: DataPoint) => {
  list.data = []
  each(list.res_ids, (id: any) => {
    if (list._cache[id]) {
      list.data.push(list._cache[id])
    }
  })
}

/**
 * 更新表体里 x2m 字段的record
 * @param records
 * @param fieldName
 * @param values
 */
const _updateRecordsData = (records: DataPoint[], fieldName: string, values: any[]) => {
  if (!records.length || !values) return

  each(records, (record: DataPoint) => {
    const x2mList = localData[record.data[fieldName]]
    x2mList.data = []
    each(x2mList.res_ids, (id: any) => {
      const rec = _makeDataPoint({
        viewType: 'form',
        modelName: x2mList.model,
        fieldsInfo: _getFieldsInfo(),
        parentId: x2mList.id,
        res_id: id,
        data: find(values, { id })
      })
      x2mList.data.push(rec.id)
      x2mList._cache[id] = rec.id
    })
  })
}

/**
 * 遍历所有localData执行给定方法
 * @param element
 * @param fn
 */
const _visitChildren = (element: DataPoint, fn: (el: DataPoint) => void) => {
  fn(element)
  if (element.type === 'record') {
    for (let fieldName in element.data) {
      const field = element.fieldsInfo[fieldName]
      if (!field) continue

      if (['one2many', 'many2many', 'many2one'].includes(field.type)) {
        const hasChange = element._changes && fieldName in element._changes
        const value = hasChange ? (element._changes as any)[fieldName] : element.data[fieldName]
        const relElement = localData[value]
        relElement && _visitChildren(relElement, fn)
      }
    }
  }

  if (element.type === 'list') {
    element = _applyX2ManyOperations(element)
    each(element.data, (id: DataPointId) => {
      const elem = localData[id]
      _visitChildren(elem, fn)
    })
  }
}

// ------  public  ------------
export let localData: LocalData = {}
export let recordMap: Map<string, DataPointId> | null
export let rootID: DataPointId
export type { DataPointId, DataPoint, DataPointData, DataPointState }

/**
 * 默认值处理
 * @param recordID
 * @param values
 * @param options
 */
export const applyDefaultValues = (recordID: DataPointId, values: any, options: any) => {
  options = options || {}
  const defs = [] as any
  const record = localData[recordID]
  const viewType = record.viewType || options.viewType
  const fieldNames = options.fieldNames
  let fieldName, field
  record._changes = record._changes || {}

  values = pick(values, fieldNames)

  // 空值
  for (var i = 0; i < fieldNames.length; i++) {
    fieldName = fieldNames[i]
    if (!(fieldName in values) && !(fieldName in record._changes)) {
      field = record.fieldsInfo[fieldName]
      if (field.type === 'float' || field.type === 'integer') {
        values[fieldName] = 0
      } else if (field.type === 'one2many' || field.type === 'many2many') {
        values[fieldName] = []
      } else {
        values[fieldName] = null
      }
    }
  }

  for (let fieldName in values) {
    field = record.fieldsInfo[fieldName]
    record.data[fieldName] = null

    let dp
    if (field.type === 'many2one' && values[fieldName]) {
      dp = _makeDataPoint({
        modelName: field.relation as string,
        data: { id: values[fieldName] },
        fieldsInfo: {
          id: { type: 'integer', name: 'id' },
          display_name: { type: 'char', name: 'display_name' }
        },
        parentId: record.id,
        viewType: viewType
      })
      record._changes[fieldName] = dp.id
    } else if (field.type === 'reference' && values[fieldName]) {
      const ref = values[fieldName].split(',')
      dp = _makeDataPoint({
        modelName: ref[0],
        data: { id: parseInt(ref[1]) },
        fieldsInfo: {
          id: { type: 'integer', name: 'id' },
          display_name: { type: 'char', name: 'display_name' }
        },
        parentId: record.id,
        viewType: viewType
      })
      defs.push(_fetchNameGet(dp))
      record._changes[fieldName] = dp.id
    } else if (field.type === 'one2many' || field.type === 'many2many') {
      defs.push(_processX2ManyCommands(record, fieldName, values[fieldName]))
    } else {
      record._changes[fieldName] = _parseServerValue(field, values[fieldName])
    }
  }

  return Promise.all(defs)
}

/**
 * 表单复制
 * @param recordID
 * @param defaultTemplate
 */
export const copyRecord = async (recordID: DataPointId, defaultTemplate?: any) => {
  const record = localData[recordID]
  const { data, fieldsInfo } = record
  const isHeader = !defaultTemplate
  const changes = record._changes || {}
  const defs = [] as any[]

  if (isHeader) {
    delete data.display_name
    delete changes.display_name
  }

  defaultTemplate = defaultTemplate || {}
  const defaultData = (defaultTemplate[record.model] =
    defaultTemplate[record.model] || (await _getDefaultData(record))._changes)
  record.res_id = uniqueId('virtual_')
  recordMap && recordMap.set(`${record.model}_${record.res_id}`, recordID)

  each(data, (value, fieldName) => {
    const field = fieldsInfo[fieldName]
    if (fieldName === 'id' || fieldName === 'state' || fieldName === 'number') {
      // TODO 判断不允许复制的字段
      changes[fieldName] = data[fieldName] = defaultData[fieldName] || false
    } else if (field.type === 'one2many') {
      defs.push(_copyX2ManyRecord(value, defaultTemplate))
    } else {
      changes[fieldName] = value
    }
  })

  await Promise.all(defs)
  record._changes = changes

  // TODO trigger onchange

  return record
}

/**
 * 表体行的复制处理
 * @param list
 * @param id
 */
export const copyLine = async (list: DataPoint, id: DataPointId) => {
  const record = localData[id]
  const fieldsInfo = list.fieldsInfo
  const localRecordID = await _addX2ManyDefaultRecord(list, {})
  const localRecord = localData[localRecordID]

  const changes = Object.assign({}, record.data, record._changes)

  each(changes, (value: any, fieldName: string) => {
    const field = fieldsInfo[fieldName]
    // TODO judge field copy option to continue

    if (field && field.type === 'one2many') {
      // TODO process o2m field in list
    } else if (fieldName !== 'id' && fieldName !== 'state') {
      changes[fieldName] = value
    }
  })

  localRecord._changes = changes
  return localRecord
}

/**
 * 解析modifiers
 * @param id
 * @param modifiers
 */
export const evalModifiers = (id: DataPointId, modifiers: any) => {
  const record = localData[id]
  return record ? _evalModifiers(record, modifiers) : null
}

/**
 * 表单数据加载入口, 只会调用一次
 * @param params
 */
export const load = async (params: LoadParams): Promise<DataPointId> => {
  clean()

  if (params.type === 'record' && !params.res_id) {
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
    if (r._isDirty) {
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
  const data = localData[id]
  if (data.type !== 'record') {
    return false
  }
  const res_id = data.res_id
  if (typeof res_id === 'number') {
    return false
  } else if (typeof res_id === 'string' && /^[0-9]+-/.test(res_id)) {
    return false
  }
  return true
}

/**
 * 获取DataPointState(合并_changes到data中)
 * @param id
 */
export const get = (id: DataPointId, options?: any) => {
  if (!(id in localData)) return null
  options = options || {}

  let element = localData[id]
  if (element.type === 'record') {
    const data = Object.assign({}, element.data, element._changes || {})
    for (let fieldName in data) {
      const field = element.fieldsInfo[fieldName]
      let relDataPoint
      if (data[fieldName] == null) {
        data[fieldName] = false
      }
      if (!field) continue

      if (field.type === 'many2one') {
        if (options.raw) {
          relDataPoint = localData[data[fieldName]]
          data[fieldName] = relDataPoint ? relDataPoint.res_id : false
        } else {
          data[fieldName] = get(data[fieldName]) || false
        }
      } else if (field.type === 'reference') {
        if (options.raw) {
          relDataPoint = localData[data[fieldName]]
          data[fieldName] = relDataPoint ? relDataPoint.model + ',' + relDataPoint.res_id : false
        } else {
          data[fieldName] = get(data[fieldName]) || false
        }
      } else if (field.type === 'one2many' || field.type === 'many2many') {
        if (options.raw) {
          if (typeof data[fieldName] === 'string') {
            relDataPoint = localData[data[fieldName]]
            relDataPoint = _applyX2ManyOperations(relDataPoint)
            data[fieldName] = relDataPoint.res_ids
          } else {
            data[fieldName] = data[fieldName] || []
          }
        } else {
          data[fieldName] = get(data[fieldName]) || []
        }
      }
    }

    return {
      ...element,
      data
    }
  }

  element = _applyX2ManyOperations(element)
  //TODO sort list?
  // _setDataInRange(element)

  const list = {
    ...element,
    data: map(element.data, (id: DataPointId) => get(id))
  } as any

  return list
}

/**
 * 根据模型和记录id获取DataPointId
 * @param modelKey
 * @param res_id
 */
export const getRecordId = (modelKey: string, res_id: string) => {
  return recordMap && (recordMap.get(`${modelKey}_${res_id}`) as DataPointId)
}

/**
 * 获取记录中某个字段的值
 * @param id
 * @param fieldName
 */
export const getRecordData = (id: DataPointId, fieldName: string) => {
  if (!id || !fieldName) return
  const record = localData[id]
  const changes = record._changes || {}
  const value = changes[fieldName] || record.data[fieldName]
  const field = record.fieldsInfo[fieldName]
  if (!field || !value) return false

  if (field.type === 'many2one' || field.type === 'reference') {
    return get(value) || false
  } else if (field.type === 'many2many' || field.type === 'one2many') {
    return get(value) || []
  } else {
    return value
  }
}

/**
 * 获取给定的reocrdId的context
 * @param id
 */
export const getEvalContext = (id: DataPointId) => {
  const element = localData[id]
  return _getEvalContext(element, false)
}

/**
 * 获取domain
 * @param id
 * @param options
 */
export const getDomain = (id: DataPointId, options: any = {}) => {
  const element = localData[id]
  return _getDomain(element, options)
}

/**
 * 获取 record._changess
 * @param record
 * @param options
 * @returns
 */
export const generateChanges = (record: DataPoint, options?: any) => {
  return _generateChanges(record, options)
}

/**
 * 值更新入口
 * @param recordID
 * @param changes
 */
export const notifyChanges = async (recordID: DataPointId, changes: DataPointData) => {
  const record = localData[recordID]
  const parentRecord = record.parentId && localData[record.parentId]

  if (parentRecord && parentRecord.type === 'list') {
    // x2many changes 子视图字段修改
    let x2manyCommad = JSON.parse(sessionStorage.getItem(sessionStorageKeys.x2manyCommand) || '{}')
    if (x2manyCommad && x2manyCommad.type === 'UPDATE') {
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
  if (typeof props === 'string') {
    return localData[props]
  } else {
    return find(values(localData), props)
  }
}

/**
 * 单据保存
 * @param recordID
 */
export const save = async (recordID: DataPointId) => {
  const record = localData[recordID]
  const method = isNew(recordID) ? 'create' : 'write'
  if (record._changes) {
    delete (record._changes as any).id
  }

  const changes = _generateChanges(record, { changesOnly: method !== 'create' })

  if (method === 'create' || Object.keys(changes).length) {
    const res = await saveRecord(record.model, method, record.data.id as number, changes)
    record._isDirty = false
    record._changes = {}

    if (res.ret === 0) {
      // reload data
      if (isNew(record.id)) {
        record.res_id = res.data
      }

      await reload(record)
    }

    return res
  }

  return true
}

/**
 * 重新加载record
 * @param record
 */
export const reload = async (record?: DataPoint) => {
  if (!record) {
    record = localData[rootID]
    if (!record || isNew(record.id)) return false
  }

  const recordId = record.id || rootID
  // 移除其他DataPoint
  each(Object.keys(localData), (key: string) => {
    key !== recordId && delete localData[key]
  })

  await _fetchRecord(record)
  return true
}

export const clean = () => {
  each(Object.keys(localData), (key: string) => {
    delete localData[key]
  })
  recordMap = new Map<string, DataPointId>()
  rootID = ''
}
