import { computed, PropType } from 'vue'
import { Field, Item } from '@/assets/js/class'

export const fieldCommonProps = {
  item: Object as PropType<Item>,
  field: Object as PropType<Field>,
  readonly: Boolean
}

export default function(props: any) {
  const string = computed(() => props.item && props.item.string)
  const placeholder = computed(() => props.item && props.item.placeholder || `请输入${string.value}`)
  const type = computed(() => props.item && props.item.fieldType)

  return {
    string,
    placeholder,
    type
  }
}