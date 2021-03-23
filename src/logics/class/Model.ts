import Field, { StudioField, OdooField } from './Field'

export interface StudioModel {
  key: string
  name: string
  fields: StudioField[]
  odoo_fields: {[key: string]: OdooField}
  [key: string]: any
}

export type Fields = {
  [key: string]: Field
}

class Model {
  key: string
  name: string
  fields: Field[]

  constructor(modelObj: StudioModel) {
    this.key = modelObj.key
    this.name = modelObj.name
    this.fields = modelObj.fields.map(f => {
      const field = new Field(f)
      const odooField = modelObj.odoo_fields[f.name]
      if(odooField) {
        // 翻译的处理
        field.string = odooField.string;
        odooField.flex && (field.flex = true);
        odooField.selection && (field.selection = odooField.selection)
        odooField.domain && (field.domain = odooField.domain)

        // 携带字段
        if(field.type === 'related') {
          field.type = odooField.type
          field.relation = odooField.relation
        }
      }
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