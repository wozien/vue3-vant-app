<template>
  <div class="app-list">
    <div v-for="item in list" :key="item.id" class="app">
      <img :src="item.icon">
      <span class="name van-multi-ellipsis--l2">{{ item.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

interface App {
  id: number;
  name: string;
  icon: string;
}

export default defineComponent({
  props: {
    appData: Array as PropType<App[]>
  },

  setup(props) {
    return {
      list: props.appData
    }
  }
})
</script>

<style lang="less" scoped>
.app-list {
  overflow: hidden;
  padding-top: 14px;
  display: flex;
  flex-wrap: wrap;
  .app {
    width: 80px;
    margin-bottom: 10px;
    .column-flex;
    img {
      width: 45px;
      height: 45px;
      margin-bottom: 6px;
    }
    .name {
      font-size: 13px;
      color: @text-color-light-1;
    }
  }
}
</style>