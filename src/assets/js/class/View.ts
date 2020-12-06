
import Item, { StudioItem } from './Item'

export type ViewType = 'form' | 'list'

export interface StudioView {
  model: string
  name: string
  type: ViewType
  mobileItems: StudioItem[],
  buttons: any[],
  options?: any
}

class View {
  model: string
  name: string
  type: ViewType
  items: Item[]
  buttons: any[]
  options?: any

  constructor(viewObj: StudioView) {
    this.model = viewObj.model
    this.name = viewObj.name
    this.type = viewObj.type
    this.options = viewObj.options || {}
    this.items = viewObj.mobileItems.map(i => new Item(i))
    this.buttons = viewObj.buttons
  }
}

export default View