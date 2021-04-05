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
import { ViewButton } from '@/logics/types'

export default defineComponent({
  props: {
    button: {
      type: Object as PropType<ViewButton>,
      required: true,
    },
  },
  emits: ['click'],

  setup(props, { emit }) {
    const highlight = computed(() => props.button && props.button.highlight)
    const onClickBtn = () => {
      emit('click', props.button?.key)
    }

    return {
      highlight,
      onClickBtn,
    }
  },
})
</script>

<style lang="less" scoped></style>
