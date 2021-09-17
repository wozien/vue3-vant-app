import { Modifiers, ModifierKey } from '../types/index'

export type FieldType =
  | 'char'
  | 'text'
  | 'integer'
  | 'float'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'selection'
  | 'one2many'
  | 'many2one'
  | 'many2many'
  | 'related'
  | 'reference'

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
  fieldKey?: string
  string?: string
  relation?: string
  selection?: [string, string][]
  onChange?: boolean
  list?: FieldsInfo
  domain?: string
  context?: string
  modifiers?: Modifiers
  relatedFields?: any
  relationField?: string
  precision?: [string, string]
  __no_fetch?: boolean
  [key: string]: any
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
  domain?: string
  fields: Field[]
  modifiers: Modifiers;
  [key: string]: any

  constructor(fieldObj: StudioField) {
    this.key = fieldObj.key
    this.name = fieldObj.name
    this.type = fieldObj.type
    this.string = fieldObj.string
    this.relation = fieldObj.relation || ''
    this.options = fieldObj.options
    this.fields = []
    this.modifiers = {}
    this._formatModifier()

    if (Array.isArray(fieldObj.fields) && fieldObj.fields.length) {
      this.fields = fieldObj.fields.map(f => new Field(f))
    }
  }

  isX2Many() {
    return ['one2many', 'many2many'].includes(this.type)
  }

  isNumber() {
    return ['integer', 'float'].includes(this.type)
  }

  isComplexField() {
    return ['selection', 'many2one', 'reference', 'one2many', 'date', 'datetime'].includes(
      this.type
    )
  }

  _isModifierKey(key: string) {
    return ['readonly', 'required'].includes(key)
  }

  _formatModifier() {
    for (let key in this.options) {
      if (this._isModifierKey(key)) {
        const value = this.options[key]
        if (value.checked) {
          this.modifiers[key as ModifierKey] = true
        }
      }
    }
  }
}

export default Field
