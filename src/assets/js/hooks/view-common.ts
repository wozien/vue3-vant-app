import { PropType } from 'vue'
import { FieldInfo, Fields, View } from '@/assets/js/class'

export const viewCommonProps = {
  fieldInfo: Object as PropType<FieldInfo>,
  fields: Object as PropType<Fields>,
  curView: Object as PropType<View>
}