<template>
  <van-icon 
    class-prefix="ins-icon"
    :size="size"
    :name="name"
    :color="color || '#646566'"
    style="margin-right: 8px"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: '20'
    },
    color: String
  }
})
</script>

<style lang="less" scoped></style>