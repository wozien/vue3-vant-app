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
import { defineComponent, ref } from 'vue'
import AppList from '@/components/app-list/AppList.vue'

const markets = [
  {
    key: 'fin',
    name: '财务',
    apps: [
      { id: 1, icon: '/img/app-icon.png', name: '报销' },
      { id: 2, icon: '/img/app-icon.png', name: '报销' },
      { id: 3, icon: '/img/app-icon.png', name: '报销' },
      { id: 4, icon: '/img/app-icon.png', name: '报销' },
      { id: 5, icon: '/img/app-icon.png', name: '报销' },
    ]
  },
  {
    key: 'scm',
    name: '生产制造',
    apps: [
      { id: 1, icon: '/img/app-icon.png', name: '报销' },
      { id: 2, icon: '/img/app-icon.png', name: '报销' },
      { id: 3, icon: '/img/app-icon.png', name: '报销' },
      { id: 4, icon: '/img/app-icon.png', name: '报销' }
    ]
  },
  {
    key: 'sss',
    name: '供应链',
    apps: [
      { id: 1, icon: '/img/app-icon.png', name: '报销' },
      { id: 2, icon: '/img/app-icon.png', name: '报销' },
      { id: 3, icon: '/img/app-icon.png', name: '报销' },
      { id: 4, icon: '/img/app-icon.png', name: '报销' },
      { id: 5, icon: '/img/app-icon.png', name: '报销' },
      { id: 6, icon: '/img/app-icon.png', name: '报销' },
    ]
  }
]

export default defineComponent({
  components: {
    AppList
  },

  setup() {
    const searchValue = ref('')

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