<template>
  <div class="list-view">
    <SearchBar
      placeholder="请输入编号或者创建人搜索"
      :show-action="true"
      :search-fields="searchBarFields"
      @click-action="showSearchView = true"
      @search="onSearch"
    />

    <div class="list-container">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="showEmpty ? '' : '没有更多了'"
          @load="onLoad"
        >
          <ListCard
            v-for="item in list"
            :key="item.id"
            :app-name="appName"
            :record="item"
            :fields-info="fieldsInfo"
          />
        </van-list>

        <van-empty v-show="showEmpty" description="暂无数据" />
      </van-pull-refresh>
    </div>

    <div class="add-btn" @click="onAddBtn" v-if="canCreate">
      <i class="ins-icon ins-icon-plus" />
    </div>

    <van-popup
      v-model:show="showSearchView"
      position="right"
      :safe-area-inset-bottom="true"
      :style="{ height: '100%', width: '80%' }"
    >
      <SearchView :fields="fields" @search="onSearch"></SearchView>
    </van-popup>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch, PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import ListCard from './ListCard.vue'
import type { Action } from '@/logics/types'
import ListRecord from '@/logics/class/ListRecord'
import { viewCommonProps } from '@/hooks/component/useView'
import { fetchListData } from '@/api/app'
import { fetchReferencesBatch, fetchX2ManysBatch } from '@/logics/class/ListRecord'
import SearchView from '@/views/search/SearchView.vue'
import SearchBar from '@/views/search/SearchBar.vue'

export default defineComponent({
  components: {
    ListCard,
    SearchView,
    SearchBar
  },

  props: {
    ...viewCommonProps,
    appName: String,
    action: Object as PropType<Action>
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const state = reactive({
      searchValue: '',
      loading: false,
      finished: false,
      refreshing: false,
      list: [] as ListRecord[],
      showSearchView: false,
      domain: [] as any[]
    })
    const searchFields = computed(() => {
      return props.fieldsInfo ? Object.keys(props.fieldsInfo) : []
    })
    const showEmpty = computed(() => {
      return state.list.length === 0 && !state.loading
    })
    const searchBarFields = computed(() => {
      const res = ['create_uid']
      if (props.fields && 'bill_number' in props.fields) res.push('bill_number')
      return res
    })
    const canCreate = computed(() => {
      return (
        props.curView &&
        props.curView.buttons.findIndex((btn: any) => btn.funcName === 'create') > -1
      )
    })

    let lastId = 0
    const onLoad = async () => {
      if (searchFields.value.length) {
        const res = await fetchListData(
          route.query.model as string,
          lastId,
          searchFields.value,
          {
            search: state.domain,
            action: props.action?.domain
          },
          props.action?.context
        )
        if (res.ret === 0) {
          const length = res.data.length
          if (length) {
            await Promise.all([
              fetchReferencesBatch(res.data, props.fieldsInfo),
              fetchX2ManysBatch(res.data, props.fieldsInfo)
            ])
            res.data.forEach((raw: any, index: number) => {
              const record = new ListRecord(raw)
              state.list.push(record)
              if (index === res.data.length - 1) lastId = record.id
            })
          }
          if (!length || length < 6) {
            state.finished = true
          }
        }
      }
      state.loading = false
    }

    const onRefresh = () => {
      state.refreshing = false
      if (state.loading) return
      state.finished = false
      state.list = []
      lastId = 0
      state.loading = true
      onLoad()
    }

    const onAddBtn = () => {
      // sessionStorage.clear()
      router.push({
        name: 'view',
        query: {
          ...route.query,
          id: '',
          viewType: 'form'
        }
      })
    }

    const onSearch = (domain: any) => {
      state.domain = domain
      onRefresh()
      state.showSearchView = false
    }

    watch(searchFields, () => {
      state.loading = true
      onLoad()
    })

    return {
      ...toRefs(state),
      curRecord: computed(() => store.getters.curRecord),
      searchFields,
      searchBarFields,
      showEmpty,
      canCreate,
      onLoad,
      onRefresh,
      onAddBtn,
      onSearch
    }
  }
})
</script>

<style lang="less" scoped>
.list-view {
  height: 100%;
  .list-container {
    height: calc(100% - 56px);
    overflow: auto;
  }

  .add-btn {
    position: absolute;
    right: 10px;
    bottom: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: @ins-primary-color;
    display: flex;
    justify-content: center;
    align-items: center;
    .ins-icon {
      color: #fff;
      font-size: 26px;
    }
  }
}
</style>
