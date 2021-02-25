<template>
  <div class="ins-loading" v-show="show">
    <van-loading vertical>{{ text }}</van-loading>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    show: Boolean,
    text: {
      type: String,
      default: '加载中...'
    }
  }
})
</script>

<style scoped lang="less">
.ins-loading {
  display: flex;
  justify-content: center;
  margin: 40px 0px;
}
</style>