import { ViewType } from './View'

export type FieldType = 'char'|'text'|'integer'|'float'|'date'|'datetime'|'boolean'|
  'selection'|'one2many'|'many2one'|'many2many'|'related'

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

export type FieldInfo = {
  [key: string]: {
    name: string
    type: FieldType
    string: string
  }
}

export type FieldsInfo = {
  [key in ViewType]: FieldInfo
}


class Field {
  key: string 
  name: string 
  type: FieldType 
  string: string
  options: any
  relation?: string
  selection?: [string, string][]
  fields: Field[]

  constructor(fieldObj: StudioField) {
    this.key = fieldObj.key
    this.name = fieldObj.name
    this.type = fieldObj.type
    this.string = fieldObj.string
    this.relation =  fieldObj.relation || ''
    this.options = fieldObj.options
    this.fields = fieldObj.fields.map(f => new Field(f))
  }
}

export default Field