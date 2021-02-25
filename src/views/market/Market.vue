<template>
  <div class="market">
    <van-search v-model="searchValue" shape="round" placeholder="搜索应用"></van-search>
    <Loading v-model:show="loading"/>
    <div class="market-wrapper" v-if="filterList.length">
      <div v-for="item in filterList" :key="item.key" class="market-item van-hairline--top">
        <span class="label">{{ item.name }}</span>
        <AppList :app-data="item.apps" />
      </div>
    </div>
    <van-empty v-else-if="!loading" :description="description" :image="emptyImage"></van-empty>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent, computed, onBeforeMount, watchEffect, reactive, toRefs } from 'vue'
import AppList from '@/components/app-list/AppList.vue'
import { fetchAppData } from '@/api/app'

export default defineComponent({
  components: {
    AppList
  },

  setup() {
    const state = reactive({
      searchValue: '',
      list: [] as any[],
      filterList: [] as any[],
      loading: true
    })

    const description = computed(() => {
      return state.searchValue ? '暂无搜索结果' : '暂无应用数据'
    })
    const emptyImage = computed(() => {
      return state.searchValue ? 'search' : 'default'
    })

    onBeforeMount(async () => {
      const res = await fetchAppData()
      state.loading = false
      if(res.ret === 0) {
        state.list = res.data.filter((item:any) => item.apps.length)
      }
    })

    watchEffect(() => {
      if(state.list.length) {
        let res: any
        if(!state.searchValue) {
          res = state.list.slice(0)
        } else {
          res = []
          for(let item of state.list) {
            const apps = item.apps.filter((app: any) => app.name.includes(state.searchValue))
            if(apps.length) {
              res.push(_.defaults({ apps }, item))
            }
          }
        }
        state.filterList = res
      }
    })

    return {
      ...toRefs(state),
      description,
      emptyImage,
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