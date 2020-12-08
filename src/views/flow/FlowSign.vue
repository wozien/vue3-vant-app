<template>
  <div class="flow-sign">
    流程加签
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const print = () => {
      console.log('hahah')
    }

    return {
      print
    }
  }
})
</script>

<style lang="less" scoped></style>