import { computed, ref, PropType, watchEffect } from 'vue'
import { VuexStore } from '@/store'
import { Field, Item, DataPointState, DataPointData } from '@/assets/js/class'
import { DataPoint } from '@/assets/js/class/DataPoint'
import fieldUtils from '@/assets/js/utils/field-utils'
import { notifyChanges } from '@/assets/js/class/DataPoint'

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
    const res = props.item && props.item.placeholder || `请输入${string.value}`
    return props.readonly ? '' : res
  })

  const value = ref<FieldValue> ('')   // format value
  const rawValue = ref<RawFieldValue>('')  // parse value
  const curRecord = computed<DataPointState>(() => store.getters.curRecord)

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

  watchEffect(() => {
    if(props.field && curRecord.value) {
      const data = curRecord.value.data
      const field = props.field
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
    }
  })

  return {
    string,
    placeholder,
    type,
    value,
    rawValue,
    curRecord,
    setValue
  }
}