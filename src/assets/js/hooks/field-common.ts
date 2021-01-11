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

  const value = ref<FieldValue> ('')   // format value
  const rawValue = ref<RawFieldValue>('')  // parse value
  const curRecord = computed<DataPointState>(() => store.getters.curRecord)

  const setValue = async (val: any) => {
    const field = props.field
    if(field) {
      const fieldType = field.type
      if(['float', 'integer'].includes(fieldType)) {
        // vant field 组件会把数字类型的设置为字符串
        if(val == rawValue.value) return
      }

      if(!['date', 'datetime'].includes(fieldType)) {
        // value is Date Object same as rawValue
        val = (fieldUtils.parse as any)[fieldType](val)
      }
      await notifyChanges(curRecord.value.id, { [field.name]: val })
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