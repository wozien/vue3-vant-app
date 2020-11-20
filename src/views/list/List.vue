<template>
  <Page name="list-view">
    <van-search v-model="searchValue" shape="round" placeholder="请输入编号搜索" background="#f7f8fa">
      <!-- <template></template> -->
    </van-search>
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
  /deep/ .van-search__content {
    background: #fff;
  }
}
</style>