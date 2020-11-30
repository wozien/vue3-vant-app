import { computed } from 'vue'

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