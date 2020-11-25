import Field, { StudioField, OdooField } from './Field'

export interface StudioModel {
  key: string
  name: string
  fields: StudioField[]
  odoo_fields: {[key: string]: OdooField}
  [key: string]: any
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
        (odooField.selection) && (field.selection = odooField.selection)
      }
      return field
    })
  }

  getField(key: string) {
    return this.fields.find(f => f.key === key|| f.name === key)
  }
}

export default Model