<template>
  <div class="market">
    <van-search v-model="searchValue" shape="round" placeholder="搜索应用"></van-search>
    <div class="market-wrapper">
      <div v-for="item in markets" :key="item.key" class="market-item van-hairline--top">
        <span class="label">{{ item.name }}</span>
        <AppList :app-data="item.apps" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount } from 'vue'
import AppList from '@/components/app-list/AppList.vue'
import { fetchAppData } from '@/api/app'

export default defineComponent({
  components: {
    AppList
  },

  setup() {
    const searchValue = ref('')
    const markets = ref([])

    onBeforeMount(async () => {
      const res = await fetchAppData()
      if(res.ret === 0) {
        markets.value = res.data.filter((item:any) => item.apps.length)
      }
    })

    return {
      searchValue,
      markets
    }
  }
})
</script>

<style lang="less" scoped>
.market {
  background: #fff;
  .market-wrapper {
    height: calc(100vh - 104px);
    overflow: auto;
    .market-item {
      padding: 10px 20px;
      .label {
        display: block;
        font-size: 14px;
        line-height: 14px;
        padding-left: 8px;
        margin: 10px 0px;
        border-left: 2px solid @primary-color;
      }
    }
  }
}
</style>