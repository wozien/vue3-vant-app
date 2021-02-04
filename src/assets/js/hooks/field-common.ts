import _ from 'lodash'
import { computed, ref, PropType, watchEffect } from 'vue'
import { VuexStore } from '@/store'
import { Field, Item, DataPointState, DataPointData, ModifierKey } from '@/assets/js/class'
import { DataPoint } from '@/assets/js/class/DataPoint'
import fieldUtils from '@/assets/js/utils/field-utils'
import { notifyChanges, evalModifiers } from '@/assets/js/class/DataPoint'

export const fieldCommonProps = {
  item: Object as PropType<Item>,
  field: Object as PropType<Field>,
  readonly: Boolean
}

export type FieldValue = string | number | boolean | Date
export type RawFieldValue = FieldValue | DataPoint

export default function(props: any, store: VuexStore) {
  const string = computed(() => props.field?.string || props.item?.string)
  const type = computed(() => props.field && props.field.type)
  const placeholder = computed(() => { 
    const text = (props.field && props.field.isComplexField()) ? '选择' : '输入'
    const res = props.item && props.item.placeholder || `请${text}${string.value}`
    return props.readonly ? '' : res
  })

  const value = ref<FieldValue> ('')   // format value
  const rawValue = ref<RawFieldValue>('')  // parse value
  const modifiers = ref()
  const curRecord = computed<DataPointState>(() => store.getters.curRecord)
  const isReadonly = computed(() => (modifiers.value && modifiers.value.readonly) || props.readonly)
  const invisible = computed(() => modifiers.value && modifiers.value.invisible)

  let lastValue: any
  const setValue = async (val: any) => {
    const field = props.field
    if(field) {
      const fieldType = field.type
      if(!['date', 'datetime'].includes(fieldType)) {
        // value is Date Object same as rawValue
        val = (fieldUtils.parse as any)[fieldType](val)
      }
      if(lastValue !== undefined && lastValue === val) return

      await notifyChanges(curRecord.value.id, { [field.name]: val })
      store.commit('SET_RECORD_TOKEN')
    }
  }

  let handle: any
  watchEffect(() => {
    if(props.field && curRecord.value && (!handle || handle === curRecord.value.id)) {
      if(!handle) handle = curRecord.value.id
      const data = curRecord.value.data
      const field = props.field as Field
      const item = props.item as Item
      const fieldName = field.name

      if(!data || !(fieldName in data)) {
        rawValue.value = false
      } else {
        rawValue.value = (data as DataPointData)[fieldName]
      }
      lastValue = rawValue.value

      if(!props.field.isX2Many()) {
        const fieldType = field.options?.relatedType || field.type
        value.value = (fieldUtils.format as any)[fieldType](rawValue.value, field)
      }

      // 计算modifiers
      if(item && field && (!modifiers.value || !_.isEmpty(modifiers.value))) {
        let evalutedModifiers = {} as any;
        ['readonly', 'required', 'invisible'].forEach((key: string) => {
          if(key in item.modifiers) {
            evalutedModifiers[key] = item.modifiers[key as ModifierKey]
          } else if(key in field.modifiers) {
            evalutedModifiers[key] = field.modifiers[key as ModifierKey]
          }
        })
        if(!_.isEmpty(evalutedModifiers)) {
          modifiers.value = evalModifiers(curRecord.value.id, evalutedModifiers)
        } else {
          modifiers.value = {}
        }
      }
    }
  })

  return {
    string,
    placeholder,
    type,
    value,
    rawValue,
    curRecord,
    modifiers,
    isReadonly,
    invisible,
    setValue
  }
}