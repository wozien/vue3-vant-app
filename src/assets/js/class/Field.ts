import { Modifiers, ModifierKey, DomainArr } from './index'

export type FieldType = 'char'|'text'|'integer'|'float'|'date'|'datetime'|'boolean'|
  'selection'|'one2many'|'many2one'|'many2many'|'related'|'reference'

export interface StudioField {
  key: string
  name: string
  type: FieldType
  string: string
  options: any
  relation?: string
  fields: StudioField[]
  [key: string]: any
}

export interface OdooField {
  name: string
  string: string
  selection: [string, string][]
  [key: string]: any
}

/**
 * 视图上存在的字段描述
 */
export interface FieldInfo {
  name: string
  type: FieldType
  string?: string
  relation?: string
  selection?: [string, string][]
  onChange?: boolean
  list?: FieldsInfo
  domain?: DomainArr
  modifiers?: Modifiers
  relatedFields?: any
  __no_fetch?: boolean
}

export type FieldsInfo = {
  [key: string]: FieldInfo
}

class Field {
  key: string 
  name: string 
  type: FieldType 
  string: string
  options: any
  relation?: string
  selection?: [string, string][]
  flex?: boolean
  fields: Field[]
  modifiers: Modifiers

  constructor(fieldObj: StudioField) {
    this.key = fieldObj.key
    this.name = fieldObj.name
    this.type = fieldObj.type
    this.string = fieldObj.string
    this.relation =  fieldObj.relation || ''
    this.options = fieldObj.options
    this.fields = fieldObj.fields.map(f => new Field(f))
    this.modifiers = {}
    this._formatModifier()
  }

  isX2Many() {
    return ['one2many', 'many2many'].includes(this.type)
  }

  isComplexField() {
    return ['selection', 'many2one', 'reference', 'one2many', 'date', 'datetime'].includes(this.type)
  }

  _isModifierKey(key: string) {
    return ['readonly', 'required'].includes(key)
  }

  _formatModifier() {
    for(let key in this.options) {
      if(this._isModifierKey(key)) {
        const value = this.options[key]
        if(value.checked) {
          this.modifiers[key as ModifierKey] = true
        }
      }
    }
  }
}

export default Field