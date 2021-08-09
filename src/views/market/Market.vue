<template>
  <div class="page market-page">
    <div class="market">
      <van-search v-model="searchValue" shape="round" placeholder="搜索应用"></van-search>
      <div class="market-wrapper" v-if="filterList.length">
        <div v-for="item in filterList" :key="item.key" class="market-item van-hairline--top">
          <span class="label">{{ item.name }}</span>
          <AppList :app-data="item.apps" />
        </div>
      </div>
      <van-empty v-if="showEmpty" :description="description" :image="emptyImage"></van-empty>
    </div>

    <TabBar active="market" />
  </div>
</template>

<script lang="ts">
import { defaults } from 'lodash-es'
import {
  defineComponent,
  computed,
  watchEffect,
  reactive,
  toRefs,
  onMounted,
  onActivated
} from 'vue'
import AppList from '@/components/app-list/AppList.vue'
import { fetchAppData } from '@/api/app'
import useToast from '@/hooks/component/useToast'
import TabBar from '@/components/tabbar/TabBar.vue'

export default defineComponent({
  components: {
    AppList,
    TabBar
  },

  setup() {
    const state = reactive({
      searchValue: '',
      list: [] as any[],
      filterList: [] as any[]
    })
    const { loading } = useToast(true)
    const showEmpty = computed(() => state.filterList.length === 0 && loading.value === false)

    const description = computed(() => {
      return state.searchValue ? '暂无搜索结果' : '暂无应用数据'
    })
    const emptyImage = computed(() => {
      return state.searchValue ? 'search' : 'default'
    })

    const loadData = async () => {
      const res = await fetchAppData()
      if (res.ret === 0) {
        state.list = res.data.filter((item: any) => item.apps.length)
      }
    }

    watchEffect(() => {
      if (state.list.length) {
        let res: any
        if (!state.searchValue) {
          res = state.list.slice(0)
        } else {
          res = []
          for (let item of state.list) {
            const apps = item.apps.filter((app: any) => app.name.includes(state.searchValue))
            if (apps.length) {
              res.push(defaults({ apps }, item))
            }
          }
        }
        state.filterList = res
      }
    })

    onMounted(async () => {
      loading.value = true
      await loadData()
      loading.value = false
    })

    onActivated(() => {
      if (!loading.value) loadData()
    })

    return {
      ...toRefs(state),
      loading,
      showEmpty,
      description,
      emptyImage
    }
  }
})
</script>

<style lang="less" scoped>
.market {
  height: calc(100% - 50px);
  background: #fff;
  .market-wrapper {
    height: calc(100% - 54px);
    overflow: auto;
    .market-item {
      padding: 10px 20px;
      .label {
        display: block;
        font-size: 14px;
        line-height: 14px;
        padding-left: 8px;
        margin: 10px 0px;
        border-left: 2px solid @ins-primary-color;
      }
    }
  }
}
</style>
