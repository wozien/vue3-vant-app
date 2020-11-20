
import Item, { StudioItem } from './Item'

export type ViewType = 'form' | 'list'

export interface StudioView {
  model: string
  name: string
  type: ViewType
  mobileItems: StudioItem[]
  options?: any
}

class View {
  model: string
  name: string
  type: ViewType
  items: Item[]
  options?: any

  constructor(viewObj: StudioView) {
    this.model = viewObj.model
    this.name = viewObj.name
    this.type = viewObj.type
    this.options = viewObj.options || {}
    this.items = viewObj.mobileItems.map(i => new Item(i))
  }
}

export default View