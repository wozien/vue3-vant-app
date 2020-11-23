<template>
  <Page name="list-view">
    <van-search v-model="searchValue" shape="round" placeholder="请输入编号搜索" show-action>
      <template #action>
        <Icon name="filter"/>  
      </template>
    </van-search>

    <div class="list-container"></div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({

  setup() {
    const searchValue = ref('')
    return {
      searchValue
    }
  }
})
</script>

<style lang="less" scoped>
.ins-list-view-page {
  .list-container {
    height: calc(100vh - 56px);
  }
}
</style>