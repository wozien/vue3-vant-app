import FieldSelection from './Selection.vue'
import FieldDate from './FieldDate.vue'
import FieldMany2One from './Many2One.vue'
import FieldReference from './Reference.vue'
import FieldMany2Many from './Many2Many.vue'
import FieldOn2Many from './One2Many.vue'
import FieldFlexDrop from '../flex/FlexDrop.vue'

const fieldResitrys = new Map<string, any>()

fieldResitrys.set('selection', FieldSelection)
fieldResitrys.set('date', FieldDate)
fieldResitrys.set('datetime', FieldDate)
fieldResitrys.set('many2one', FieldMany2One)
fieldResitrys.set('material_many2one', FieldMany2One)
fieldResitrys.set('reference', FieldReference)
fieldResitrys.set('many2many', FieldMany2Many)
fieldResitrys.set('many2many_tags', FieldMany2Many)
fieldResitrys.set('one2many', FieldOn2Many)
fieldResitrys.set('flex_dropdown', FieldFlexDrop)
fieldResitrys.set('pschar2one', FieldMany2One)

const noSupportWidget = ['related', 'blank']

export function getFieldComponent(fieldType: string, widget?: string): any {
  let fieldComponent = fieldResitrys.get(fieldType)
  if (widget && widget !== fieldType && noSupportWidget.includes(widget) === false) {
    fieldComponent = fieldResitrys.get(widget)
    if (!fieldComponent && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`no exit widget: ${widget}`)
    }
  }

  return fieldComponent
}
