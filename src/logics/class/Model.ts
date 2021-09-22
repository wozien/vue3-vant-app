import Field, { StudioField, OdooField } from './Field'

export interface StudioModel {
  key: string
  name: string
  fields: StudioField[]
  odoo_fields: { [key: string]: OdooField }
  [key: string]: any
}

export type Fields = {
  [key: string]: Field
}

export type KeyNameMap = {
  [key: string]: string
}

class Model {
  key: string
  name: string
  type: string
  fields: Field[]
  keyNameMap: KeyNameMap

  constructor(modelObj: StudioModel) {
    this.key = modelObj.key
    this.name = modelObj.name
    this.type = modelObj.type
    this.keyNameMap = {}
    this.fields = modelObj.fields.map(f => {
      const odooField = modelObj.odoo_fields[f.name]
      const field = new Field(f, odooField)
      this.keyNameMap[f.key] = f.name
      return field
    })
  }

  getField(key: string) {
    return this.fields.find(f => f.key === key || f.name === key)
  }

  getFields(): Fields {
    const res = {} as Fields
    this.fields.forEach((field: Field) => {
      res[field.name] = field
    })
    return res
  }

  getFlexFields(): Field[] {
    return this.fields.filter((f: Field) => f.flex)
  }
}

export default Model
