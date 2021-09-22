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

  constructor(fieldObj: StudioField, odooField?: any) {
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

    if (odooField) {
      this._patchProps(odooField)
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

  /**
   * 处理odoo解析后的字段属性
   * @param odooField
   */
  _patchProps(odooField: any) {
    if (odooField) {
      const { string, flex, selection, domain, digits } = odooField
      // 翻译的处理
      string && (this.string = string)
      flex && (this.flex = true)
      selection && (this.selection = selection)
      domain && (this.domain = domain)
      digits && (this.digits = digits)

      // 携带字段
      if (this.type === 'related') {
        this.type = odooField.type
        this.relation = odooField.relation
      }
      if (this.type === 'one2many') {
        this.relation_field = odooField.relation_field
      }

      // 状态过滤
      if (odooField.states) {
        const modifiers = this._stateToModifilers(odooField)
        for (let attr in modifiers) {
          if (modifiers[attr]) {
            this.modifiers[attr as ModifierKey] = modifiers[attr]
          }
        }
      }
    }
  }

  _isModifierKey(key: string) {
    return ['readonly', 'required', 'invisible'].includes(key)
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

  /**
   * @file core/odoo/addons/base/models/ir_ui_view.py:43
   * odoo 字段 states 转为modifier处理
   * 格式为 { 'audit': [['readonly', true]], 'submit': [['readonly', true]] }
   * @param odooField
   */
  _stateToModifilers(odooField: any) {
    const { states } = odooField
    const defaultVals = {} as any
    const stateMaps = {} as any
    const modifiers = {} as any
    for (let attr of ['readonly', 'required', 'invisible']) {
      defaultVals[attr] = !!odooField[attr]
      stateMaps[attr] = []
    }

    for (let item of Object.entries(states)) {
      const [state, modifs] = item as any
      for (let modif of modifs) {
        if (defaultVals[modif[0]] != modif[1]) {
          stateMaps[modif[0]].push(state)
        }
      }
    }

    for (let item of Object.entries(defaultVals)) {
      const [attr, defaultVal] = item as any
      if (stateMaps[attr].length) {
        modifiers[attr] = [['state', `${defaultVal ? 'not in' : 'in'}`, stateMaps[attr]]]
      } else {
        modifiers[attr] = defaultVal
      }
    }
    return modifiers
  }
}

export default Field
