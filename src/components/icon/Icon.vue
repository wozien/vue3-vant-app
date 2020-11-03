<template>
  <van-icon 
    class-prefix="ins-icon" 
    size="20"
    :name="name"
    color="#646566"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    }
  }
})
</script>

<style lang="less" scoped></style>