import { FieldType } from './Field'
import View, { StudioView } from './View'
import { Modifiers, ModifierKey } from '../types'
export interface StudioItem {
  key: string
  string: string
  widget: string
  fieldType: FieldType
  fieldKey: string
  placeholder: string
  domain: string
  attrs?: any
  options?: any
  items: StudioItem[]
  subView?: StudioView[]
  [key: string]: any
}

class ViewItem {
  key: string
  string: string
  widget: string
  fieldType: FieldType
  fieldKey: string
  placeholder: string
  items: ViewItem[]
  modifiers: Modifiers
  domain: string
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
    this.domain = itemObj.domain
    this.attrs = itemObj.attrs || {}
    this.options = itemObj.options || {}
    this.items = itemObj.items.map((i) => new ViewItem(i))
    this.modifiers = {}

    if (itemObj.subView?.length) {
      this.subView = itemObj.subView.map((v) => new View(v))
    }

    this._formatModifier()
  }

  get isContainer() {
    return ['notebook', 'group', 'page'].includes(this.widget)
  }

  get isSupportWidget() {
    return ['flex_dropdown'].includes(this.widget)
  }

  get fieldsToFetch() {
    if (this.widget === 'many2many_tags') {
      return {
        display_name: { type: 'char' },
      }
    }
    return null
  }

  _isModifierKey(key: string) {
    return ['readonly', 'required', 'invisible', 'columnInvisible'].includes(key)
  }

  _formatModifier() {
    for (let key in this.attrs) {
      if (this._isModifierKey(key)) {
        const value = this.attrs[key] as any
        if (value.checked) {
          this.modifiers[key as ModifierKey] = value.domain?.length ? value.domain : value.checked
        }
      }
    }
  }
}

export default ViewItem
