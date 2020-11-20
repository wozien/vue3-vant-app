import Field, { StudioField } from './Field'

export interface StudioModel {
  key: string
  name: string
  fields: StudioField[]
  [key: string]: any
}

class Model {
  key: string
  name: string
  fields: Field[]

  constructor(modelObj: StudioModel) {
    this.key = modelObj.key
    this.name = modelObj.name
    this.fields = modelObj.fields.map(f => new Field(f))
  }
}

export default Model