import FieldSelection from './Selection.vue'
import FieldDate from './FieldDate.vue'
import FieldMany2One from './Many2One.vue'
import FieldReference from './Reference.vue'
import FieldMany2Many from './Many2Many.vue'
import FieldOn2Many from './One2Many.vue'
import FieldFlexDrop from '../flex/FlexDrop.vue'
import { wrapperEnv } from '@/helpers/utils'

const { IS_DEV } = wrapperEnv()

const fieldResitrys = new Map<string, any>()

fieldResitrys.set('selection', FieldSelection)
fieldResitrys.set('date', FieldDate)
fieldResitrys.set('datetime', FieldDate)
fieldResitrys.set('many2one', FieldMany2One)
fieldResitrys.set('reference', FieldReference)
fieldResitrys.set('many2many', FieldMany2Many)
fieldResitrys.set('one2many', FieldOn2Many)
fieldResitrys.set('flex_dropdown', FieldFlexDrop)
fieldResitrys.set('pschar2one', FieldMany2One)

export function getFieldComponent(fieldType: string, widget?: string): any {
  let fieldComponent
  if (widget) {
    fieldComponent = fieldResitrys.get(widget)
    if (!fieldComponent && IS_DEV) {
      // eslint-disable-next-line no-console
      console.error(`widget no exit: ${widget}`)
    }
  }

  if (!fieldComponent) {
    fieldComponent = fieldResitrys.get(fieldType)
  }
  return fieldComponent
}
