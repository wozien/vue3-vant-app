<template>
  <div class="ins-page"></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    className: Array as PropType<string[]>
  }
})
</script>

<style lang="less">
.ins-page {
  height: 100%;
}
</style>