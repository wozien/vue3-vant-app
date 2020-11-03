<template>
  <div :class="['ins-page', name && `ins-${name}-page`]">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: String
  }
})
</script>

<style lang="less">
.ins-page {
  height: 100%;
}
</style>