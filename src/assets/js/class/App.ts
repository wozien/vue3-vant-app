/**
 * 应用类
 */

import { Action, Model, View, ViewType } from './index' 
import { fetchAction, fetchAppModel, fetchAppView } from '@/api/app'

class App {
  private _is_load: boolean = false
  id: number
  name: string
  actionId: number
  action?: Action
  models?: { [key: string]: Model }
  views?: { [key in ViewType]: View }

  constructor(appId: number, actionId: number) {
    this.id = appId
    this.name = ''
    this.actionId = actionId
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
    const res = await fetchAppModel(this.id, this.actionId)
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
    const res = await fetchAppView(this.id, this.actionId)
    if(res.ret === 0) {
      const views = res.data
      for(let type in views) {
        this.views[type as ViewType] = new View(views[type])
      }
    }
    return true
  }
}

export default App