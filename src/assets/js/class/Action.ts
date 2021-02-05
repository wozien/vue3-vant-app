
import { ViewType } from './View'
import Domain from '@/assets/js/odoo/Domain'

const stringToDomain = Domain.prototype.stringToArray

type ActionView = [number, ViewType]

export interface ActionRaw {
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
  domain: any[]
  modelKey: string
  context?: any
  views: ActionView[]

  constructor(raw: ActionRaw) {
    this.id = raw.id
    this.name = raw.name
    this.views = raw.views
    this.modelKey = raw.res_model
    this.domain = raw.domain.length ? stringToDomain(raw.domain) : []

    // TODO action context 处理
    // if(raw.context) {
    //   this.context = JSON.parse(raw.context)
    // }
  }
}

export default Action