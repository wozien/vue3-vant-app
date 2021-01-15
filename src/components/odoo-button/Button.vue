<template>
  <van-button 
    :type="highlight ? 'primary' : 'default'"
    :loading="button.loading"
    size="small" 
    round
    @click="onClickBtn"
  >
    {{ button.string }}
  </van-button>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ViewButton } from '@/assets/js/class'

export default defineComponent({
  props: {
    button: Object as PropType<ViewButton>,
    isPrimary: Boolean
  },
  emits: ['click'],

  setup(props, { emit }) {
    const highlight = computed(() => props.button && props.button.highlight || props.isPrimary)
    const onClickBtn = () => {
      emit('click', props.button?.key)
    }

    return {
      highlight,
      onClickBtn
    }
  }
})
</script>

<style lang="less" scoped></style>