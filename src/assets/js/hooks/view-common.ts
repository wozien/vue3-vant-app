import { PropType } from 'vue'
import { FieldsInfo, Fields, View } from '@/assets/js/class'

export const viewCommonProps = {
  fieldsInfo: Object as PropType<FieldsInfo>,
  fields: Object as PropType<Fields>,
  curView: Object as PropType<View>
}