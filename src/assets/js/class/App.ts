/**
 * 应用类
 */
import _ from 'lodash'
import { Action, Model, View, ViewType, Item, Field, FieldsInfo, FieldInfo } from './index' 
import { fetchAction, fetchAppModel, fetchAppView } from '@/api/app'
import { fetchFlowView } from '@/api/workflow'
import { findTree } from '@/assets/js/utils/tools'
import { sessionStorageKeys } from '@/assets/js/constant'
 
// TODO 限制缓存个数
const appCaches: {[key: string]: App} = {}
let activeAppKey: string

class App {
  private _is_load: boolean = false
  key: string
  modelKey: string
  name: string
  actionId?: number
  action?: Action
  models: { [key: string]: Model } | null = null
  views: { [key in ViewType]: View } | null = null
  fieldsInfo?: {
    [key in ViewType]: FieldsInfo
  }

  constructor(appKey: string, modelKey: string, actionId?: number) {
    this.key = appKey
    this.name = ''
    this.modelKey = modelKey
    actionId && (this.actionId = actionId)
  }

  get isLoaded() {
    return this._is_load
  }

  async load() {
    await Promise.all([
      this.loadAction(),
      this.loadModels(),
      this.loadViews()
    ])
    // TODO 暂不处理加载异常
    this._is_load = true
    if(this.views) {
      this.fieldsInfo = {} as any
      this.getViewFields(Object.values(this.views))
    }
  }

  async loadAction() {
    if(this.actionId) {
      const res = await fetchAction(this.actionId)
      if(res.ret === 0) {
        this.action = new Action(res.data)
        this.name = this.action.name
      }
    }
    return true
  }

  async loadModels() {
    this.models = {}
    const res = await fetchAppModel(this.modelKey)
    if(res.ret === 0) {
      const models = res.data
      for(let modelKey in models) {
        const model = new Model(models[modelKey])
        this.models[modelKey] = model
        if(!this.actionId && model.key === this.modelKey) {
          this.name = model.name
        }
      }
    }
    return true
  }

  async loadViews() {
    this.views = {} as { [key in ViewType]: View }
    let res
    if(this.actionId) {
      res = await fetchAppView(this.actionId)
    } else {
      const flowParams = JSON.parse(sessionStorage.getItem(sessionStorageKeys.flowParams) || '{}')
      res = await fetchFlowView(this.modelKey, _.pick(flowParams, ['type', 'bill_number', 'task_id', 'process_id']))
    }

    if(res.ret === 0) {
      const views = res.data
      for(let type in views) {
        this.views[type as ViewType] = new View(views[type])
      }
    }
    return true
  }

  getModel(modelKey?: string) {
    if(this.models) {
      modelKey = modelKey || this.action?.modelKey || Object.keys(this.models)[0]
      return this.models[modelKey]
    }
    return null
  }

  getView(viewType: ViewType, modelKey: string) {
    let view =  this.views ? this.views[viewType] : null
    if(view && view.model !== modelKey) {
      const subViews = view.getSubViews()
      view = _.find(subViews, { model: modelKey }) as View
    }
    return view
  }

  /**
   * 整理视图字段数据, 可以理解为把odoo的DataPoint中的fields和fieldsInfo整合到一起
   * @param views 
   * @param parentObj 
   */
  getViewFields(views: View[], parentObj?: any) {
    parentObj = parentObj || this.fieldsInfo

    for(let view of views) {
      const model = this.getModel(view.model)

      if(model) {
        const fieldsInfo = {} as FieldsInfo
        findTree(view.items, (item: Item) => {
          if(item.fieldKey) {
            const field = model.getField(item.fieldKey)
            if(!field) return
            const info = this._getFieldInfo(field, item)
            fieldsInfo[info.name] = info
          }
        }, 'items')

        const flexFields = model.getFlexFields()
        if(flexFields.length) {
          flexFields.forEach((field: Field) => {
            const info = this._getFieldInfo(field)
            fieldsInfo[info.name] = info
          })
        }
        parentObj[view.type] = fieldsInfo
      }
    }
  }

  _getFieldInfo(field: Field, item?: Item) {
    const options = field?.options || {}
    const info: FieldInfo = {
      type: options.relatedType || field.type,
      name: field.name,
      string: field.string || item?.string
    }
    field.relation && (info.relation = field.relation)
    field.selection && (info.selection = field.selection)

    if(item) {
      if(item.subView?.length) {
        this.getViewFields(item?.subView, info)
      }
      if(item.attrs?.on_change === '1') {
        info.onChange = true
      }
      if(item.domain.length) {
        info.domain = item.domain
      }
      if(!_.isEmpty(item.modifiers)) {
        info.modifiers = item.modifiers
      }
    }
    
    if(field.flex) {
      info.modifiers = Object.assign({}, info.modifiers || {}, {
        invisible: true
      })
    }
    return info
  }
}

/**
 * 获取app
 * @param appId 
 * @param actionId 
 */
export const getAppAsync : (
  modelKey: string,
  menuId?: string,
  actionId?: number | string
) => Promise<App> = async (modelKey, menuId, actionId) => {
  let app: App

  if(actionId && typeof actionId === 'string') actionId = +actionId
  let appKey = `app_${modelKey}_${ menuId || new Date().getTime() }`
  
  // 优先取缓存
  if(appCaches[appKey]) {
    app = appCaches[appKey]
  } else {
    app = new App(appKey, modelKey, actionId as number)
    appCaches[appKey] = app
  } 

  if(app && !app.isLoaded) {
    await app.load()
  }
  activeAppKey = appKey
  return app
}

/**
 *  获取app
 * @param appId 
 */
export const getApp = (appKey?: string) => {
  appKey = appKey || activeAppKey
  return appCaches[appKey]
} 


export default App