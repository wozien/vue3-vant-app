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
  const string = computed(() => props.item && (props.item.string || props.field.string))
  const placeholder = computed(() => props.item && props.item.placeholder || `请输入${string.value}`)
  const type = computed(() => props.field && props.field.type)

  const value = ref<FieldValue> ('')
  const rawValue = ref<RawFieldValue>('')
  const curRecord = computed<DataPointState>(() => store.getters.curRecord)

  const setValue = (value: any) => {
    const field = props.field
    if(field) {
      value = (fieldUtils.parse as any)[field.type](value)
      notifyChanges(curRecord.value.id, { [field.name]: value })
    }
    store.commit('SET_RECORD_TOKEN')
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
      
      if(!props.field.isX2Many()) {
        value.value = (fieldUtils.format as any)[field.type](rawValue.value, field)
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