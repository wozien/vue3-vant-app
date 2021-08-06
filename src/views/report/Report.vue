<template>
  <div class="report-view">
    <iframe v-if="reportURL" class="report-view-detail" :src="reportURL" />
    <div v-else class="report-view-list">
      <van-search v-model="searchValue" shape="round" placeholder="输入报表名称搜索" />
      <div class="list-wrapper" v-if="filterList.length">
        <div v-for="item in filterList" :key="item.key" class="report-group van-hairline--top">
          <span class="label">{{ item.name }}</span>
          <ReportList :list="item.apps" />
        </div>
      </div>
      <van-empty v-if="showEmpty" :description="description" :image="emptyImage"></van-empty>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  toRefs,
  watchEffect,
  onMounted,
  onActivated
} from 'vue'
import { useRoute } from 'vue-router'
import { fetchReportList } from '@/api/app'
import { defaults } from 'lodash-es'
import useTitle from '@/hooks/web/useTitle'
import useToast from '@/hooks/component/useToast'
import ReportList from '@/components/app-list/ReportList.vue'
import { sessionStorageKeys } from '@/logics/enums/cache'

export default defineComponent({
  components: {
    ReportList
  },

  setup() {
    const route = useRoute()
    const { loading } = useToast()
    const title = useTitle()

    const state = reactive({
      searchValue: '',
      list: [] as any[],
      filterList: [] as any[]
    })
    const reportURL = computed(() => {
      const id = route.params.id
      const report = getReportData()
      return id && report ? (report as any).bi_url : ''
    })
    const showEmpty = computed(() => state.list.length === 0 && loading.value === false)
    const description = computed(() => {
      return state.searchValue ? '暂无搜索结果' : '暂无应用数据'
    })
    const emptyImage = computed(() => {
      return state.searchValue ? 'search' : 'default'
    })

    const loadData = async () => {
      const res = await fetchReportList()
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

    watchEffect(() => {
      let report
      if (route.params.id) {
        report = getReportData()
      }
      title.value = report ? (report as any).name : '报表'
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
      reportURL,
      showEmpty,
      description,
      emptyImage
    }
  }
})

function getReportData() {
  let reportData = sessionStorage.getItem(sessionStorageKeys.reportData)
  return reportData ? JSON.parse(reportData) : null
}
</script>

<style lang="less" scoped>
.report-view {
  height: 100%;
  &-list,
  &-detail {
    height: 100%;
    width: 100%;
  }

  &-list {
    background-color: #fff;
    .list-wrapper {
      height: calc(100% - 54px);
      overflow-y: auto;
      .report-group {
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
}
</style>
