<template>
  <van-field class="form-item-field" 
    :label="string" 
    :placeholder="placeholder" 
    input-align="right"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Item } from '@/assets/js/class'

export default defineComponent({
  props: {
    renderItem: Object as PropType<Item>
  },

  setup(props) {
    const string = computed(() => props.renderItem && props.renderItem.string)
    const placeholder = computed(() => props.renderItem && props.renderItem.placeholder || `请输入${string.value}`)

    return {
      string,
      placeholder
    }
  }
})
</script>

<style lang="less" scoped></style>