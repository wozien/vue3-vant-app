import { FieldType } from './Field'
import View, { StudioView } from './View'

export interface StudioItem {
  key: string
  string: string
  widget: string
  fieldType: FieldType
  fieldKey: string
  placeholder: string
  attrs?: any
  options?: any
  items: StudioItem[]
  subView: StudioView[]
  [key: string]: any
}

class Item {
  key: string
  string: string
  widget: string
  fieldType: FieldType
  fieldKey: string
  placeholder: string
  items: Item[]
  attrs?: any
  options?: any
  subView?: View[]

  constructor(itemObj: StudioItem) {
    this.key = itemObj.key
    this.string = itemObj.string
    this.widget = itemObj.widget
    this.fieldType = itemObj.fieldType
    this.fieldKey = itemObj.fieldKey
    this.placeholder = itemObj.placeholder
    this.attrs = itemObj.attrs || {}
    this.options = itemObj.options || {}
    this.items = itemObj.items.map(i => new Item(i))

    if(itemObj.subView?.length) {
      this.subView = itemObj.subView.map(v => new View(v))
    }
  }
}

export default Item