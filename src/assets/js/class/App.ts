/**
 * 应用类
 */

import { Action, Model, View, ViewType } from './index' 
import { fetchAction, fetchAppModel, fetchAppView } from '@/api/app'
import { fetchFlowView } from '@/api/workflow'

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
  models?: { [key: string]: Model }
  views?: { [key in ViewType]: View }

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
        this.models[modelKey] = new Model(models[modelKey])
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
      res = await fetchFlowView(this.modelKey, flowParams)
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