/**
 * 应用类
 */

import { Action, Model, View, ViewType } from './index' 
import { fetchAction, fetchAppModel, fetchAppView } from '@/api/app'

// TODO 限制缓存个数
const appCaches: {[key: string]: App} = {}
let activeAppId: number = 0

class App {
  private _is_load: boolean = false
  id: number
  actionId: number
  modelKey: string
  name: string
  action?: Action
  models?: { [key: string]: Model }
  views?: { [key in ViewType]: View }

  constructor(appId: number, actionId: number, modelKey: string) {
    this.id = appId
    this.name = ''
    this.actionId = actionId
    this.modelKey = modelKey
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
    const res = await fetchAction(this.actionId)
    if(res.ret === 0) {
      this.action = new Action(res.data)
      this.name = this.action.name
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
    const res = await fetchAppView(this.actionId)
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
  id: number | string,
  actionId: number | string,
  modelKey: string
) => Promise<App> = async (appId, actionId, modelKey) => {
  let app: App

  if(typeof appId === 'string') appId = +appId
  if(typeof actionId === 'string') actionId = +actionId
  
  // 优先取缓存
  if(appCaches[appId]) {
    app = appCaches[appId]
  } else {
    app = new App(appId, actionId, modelKey)
    appCaches[appId] = app
  } 

  if(app && !app.isLoaded) {
    await app.load()
  }
  activeAppId = appId
  return app
}

/**
 *  获取app
 * @param appId 
 */
export const getApp = (appId?: string | number) => {
  appId = appId || activeAppId
  return appCaches[appId]
} 


export default App