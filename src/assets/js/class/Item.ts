import { FieldType } from './Field'
import View, { StudioView } from './View'
import { Modifiers, ModifierKey, DomainArr } from './index'
export interface StudioItem {
  key: string
  string: string
  widget: string
  fieldType: FieldType
  fieldKey: string
  placeholder: string
  domain: DomainArr
  attrs?: any
  options?: any
  items: StudioItem[]
  subView?: StudioView[]
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
  modifiers: Modifiers
  domain: DomainArr
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
    this.items = itemObj.items.map(i => new Item(i))
    this.modifiers = {}

    if(itemObj.subView?.length) {
      this.subView = itemObj.subView.map(v => new View(v))
    }

    this._formatModifier();
  }

  get isContainer() {
    return ['notebook', 'group', 'page'].includes(this.widget)
  }

  get isSupportWidget() {
    return ['flex_dropdown'].includes(this.widget)
  }

  get fieldsToFetch() {
    if(this.widget === 'many2many_tags') {
      return {
        display_name: { type: 'char' }
      }
    }
    return null
  }

  _isModifierKey(key: string) {
    return ['readonly', 'required', 'invisible', 'column_invisible'].includes(key)
  }

  _formatModifier() {
    for(let key in this.attrs) {
      if(this._isModifierKey(key)) {
        const value = this.attrs[key] as any
        if(value.checked) {
          this.modifiers[key as ModifierKey] = value.domain?.length ? value.domain : value.checked
        }
      }
    }
  }

  stringifyDomain() {
    const domain = this.domain.map((item: any) => {
      if(Array.isArray(item)) {
        let [field, operator, value, type] = item
        if(typeof value === 'boolean') {
          value = value ? 'True' : 'False'
        }
        if(type !== '0' || value === 'False' || value === 'True') {
          item = `('${field}', '${operator}', ${value})`
        } else {
          item = `('${field}', '${operator}', '${value}')`
        } 
      }
      return item
    })

    return '[' + domain.reduce((pre, cur) => {
      if(cur === '&' || cur === '|') {
        cur = `'${cur}'`
      }
      return pre ? pre + ', ' + cur : pre + cur
    }, '') + ']'
  }
}

export default Item