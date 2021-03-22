
import type { ViewType } from './View'
import Context from '@/logics/odoo/Context'
import pyUtils from '@/logics/odoo/py_utils'

type ActionView = [number, ViewType]
interface ActionRaw {
  id: number
  name: string
  domain: string
  context: string
  res_model: string
  views: ActionView[]
  [key: string]: any
}

class Action {
  id: number
  name: string
  domain: any
  modelKey: string
  context?: Recordable
  views: ActionView[]

  constructor(action: ActionRaw) {
    this.id = action.id
    this.name = action.name
    this.views = action.views
    this.modelKey = action.res_model

    if(action.context) {
      const context = new Context(action.context)
      this.context = pyUtils.eval('context', context)
    }

    if(action.domain) {
      this.domain = pyUtils.eval('domain', action.domain, this.context || {})
    }
  }
}

export default Action