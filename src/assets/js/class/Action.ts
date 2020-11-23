
import { ViewType } from './View'
import Domain from './Domain'

type ActionView = [number, ViewType]

interface ActionRaw {
  id: number
  name: string
  domain: string
  context: string
  views: ActionView[]
  [key: string]: any
}

class Action {
  id: number
  name: string
  domain: Domain
  context?: any
  views: ActionView[]

  constructor(raw: ActionRaw) {
    this.id = raw.id
    this.name = raw.name
    this.views = raw.views
    this.domain = new Domain(raw.domain)
  }
}

export default Action