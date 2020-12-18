/**
 * 应用类
 */
import _ from 'lodash'
import { Action, Model, View, ViewType, Item, FieldType } from './index' 
import { fetchAction, fetchAppModel, fetchAppView } from '@/api/app'
import { fetchFlowView } from '@/api/workflow'
import { findTree } from '@/assets/js/utils/tools'

// TODO 限制缓存个数
const appCaches: {[key: string]: App} = {}
let activeAppKey: string

type FieldsInfo = {
  [key in ViewType]: {
    [key: string]: {
      name: string
      type: FieldType
      string: string
    }
  }
}

class App {
  private _is_load: boolean = false
  key: string
  modelKey: string
  name: string
  actionId?: number
  action?: Action
  models: { [key: string]: Model } | null = null
  views: { [key in ViewType]: View } | null = null
  fieldsInfo?: FieldsInfo

  constructor(appKey: string, modelKey: string, actionId?: number) {
    this.key = appKey
    this.name = ''
    this.modelKey = modelKey
    actionId && (this.actionId = actionId)
    this.fieldsInfo = {} as FieldsInfo
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
    this.views && this.getViewFields(Object.values(this.views))
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
      const flowParams = JSON.parse(sessionStorage.getItem('FLOW_PARAMS') || '{}')
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

  getView(viewType: ViewType) {
    return this.views ? this.views[viewType] : null
  }

  getViewFields(views: View[], parentObj?: any) {
    parentObj = parentObj || this.fieldsInfo
    for(let view of views) {
      const fieldsInfo = {} as any
      const model = this.getModel(view.model)
      findTree(view.items, (item: Item) => {
        if(item.fieldKey) {
          const field = model?.fields.find(f => f.key === item.fieldKey)
          if(field) {
            const info = {
              ..._.pick(item, ['string', 'fieldType']),
              name: field.name
            }
            if(item.subView?.length) {
              this.getViewFields(item.subView, info)
            }
            fieldsInfo[info.name] = info
          }
        }
      }, 'items')
      parentObj[view.type] = fieldsInfo
    }
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