/**
 * Action 类
 */
import type { ViewType } from './View'
import Context from '@/logics/odoo/Context'
import pyUtils from '@/logics/odoo/py_utils'

type ActionView = [number, ViewType]
type ActionType =
  | 'ir.actions.act_window'
  | 'ir.actions.cus_function'
  | 'ir.actions.act_window_close'
type ActionTarget = 'new' | 'main' | 'inline'
class Action {
  id: number
  name: string
  type: ActionType
  target?: ActionTarget
  domain: any
  modelKey: string
  context: Recordable
  views: ActionView[]
  raw: any

  constructor(action: Recordable) {
    this.id = action.id
    this.name = action.name
    this.type = action.type
    this.target = action.target
    this.views = action.views
    this.modelKey = action.res_model
    this.raw = action

    if (action.context) {
      const context = new Context(action.context)
      // this.context = pyUtils.eval('context', context)
      this.context = context.eval()
    } else {
      this.context = {}
    }

    if (action.domain) {
      this.domain = pyUtils.eval('domain', action.domain, this.context)
    }
  }
}

export default Action
