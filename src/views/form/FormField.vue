<template>
  <!-- selection -->
  <!-- many2one -->
  <!-- one2many -->
  <!-- normal -->
  <van-field class="form-item-field" 
    :label="string" 
    :placeholder="placeholder" 
    input-align="right"
    v-model="rawValue"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue'
import { Item, Field, Record } from '@/assets/js/class'

export default defineComponent({
  props: {
    item: Object as PropType<Item>,
    field: Object as PropType<Field>,
    record: Object as PropType<Record>
  },

  setup(props) {
    const rawValue = ref('')
    const string = computed(() => props.item && props.item.string)
    const placeholder = computed(() => props.item && props.item.placeholder || `请输入${string.value}`)

    watchEffect(() => {
      if(props.record && props.field) {
        let recordRaw = props.record.raw;
        if(Array.isArray(recordRaw)) {
          recordRaw = recordRaw[0]
        }
        rawValue.value = recordRaw[props.field.name]
      }
    })

    return {
      string,
      placeholder,
      rawValue
    }
  }
})
</script>

<style lang="less" scoped></style>