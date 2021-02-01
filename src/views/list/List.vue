<template>
  <Page name="list-view">
    <SearchBar 
      placeholder="请输入编号或者创建人搜索" 
      :show-action="true" 
      :search-fields="searchBarFields"
      @click-action="showSearchView=true"
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
          <ListCard v-for="item in list"
            :key="item.id" 
            :app-name="appName" 
            :record="item" 
            :fields-info="fieldsInfo"
          />
        </van-list>
      </van-pull-refresh>

      <van-empty v-show="showEmpty" description="暂无数据"/>
    </div>

    <div class="add-btn" @click="onAddBtn">
      <i class="ins-icon ins-icon-plus" />
    </div> 

    <van-popup 
      v-model:show="showSearchView" 
      position="right" 
      :safe-area-inset-bottom="true"
      :style="{height: '100%', width: '80%'}"
    >
      <SearchView :fields="fields" @search="onSearch"></SearchView>
    </van-popup>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ListCard from './ListCard.vue'
import { Record } from '@/assets/js/class'
import { viewCommonProps } from '@/assets/js/hooks/view-common'
import { fetchListData } from '@/api/app'
import { fetchReferencesBatch } from '@/assets/js/class/Record'
import SearchView from '@views/search/SearchView.vue'
import SearchBar from '@views/search/SearchBar.vue'

export default defineComponent({
  components: {
    ListCard,
    SearchView,
    SearchBar
  },

  props: {
    ...viewCommonProps,
    appName: String
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()

    const state = reactive({
      searchValue: '',
      loading: false,
      finished: false,
      refreshing: false,
      list: [] as Record[],
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
      if(props.fields && 'bill_number' in props.fields) res.push('bill_number')
      return res
    })

    let lastId = 0;
    const onLoad = async () => {
      if(searchFields.value.length) {      
        const res = await fetchListData(route.query.model as string, lastId, searchFields.value, 6, state.domain)
        state.refreshing = false
        if(res.ret === 0) {
          const length = res.data.length
          if(length) {
            await fetchReferencesBatch(res.data, props.fieldsInfo)
            state.loading = false  // loading的状态需要放在所有后面
            res.data.forEach((raw: any, index: number) => {
              const record = new Record(raw)
              state.list.push(record)
              if(index === res.data.length - 1) lastId = record.id
            })
          } 
          if(!length || length < 6) {
            state.finished = true
            state.loading = false 
          }
        } 
      } else {
        state.loading = false
      }
    }

    const onRefresh = () => {
      state.finished = false
      state.list = []
      state.loading = true
      lastId = 0
      onLoad()
    }

    const onAddBtn = () => {
      // sessionStorage.clear()
      router.push({
        name: 'view',
        query: {
          model: route.query.model,
          viewType: 'form',
          id: ''
        }
      })
    }

    const onSearch = (domain: any) => {
      state.domain = domain
      onRefresh()
      state.showSearchView = false
    }

    watch(searchFields, () => {
      onLoad()
    })

    return {
      ...toRefs(state),
      searchFields,
      searchBarFields,
      showEmpty,
      onLoad,
      onRefresh,
      onAddBtn,
      onSearch
    }
  }
})
</script>

<style lang="less" scoped>
.ins-list-view-page {
  .list-container {
    height: calc(100vh - 56px);
    overflow: auto;
  }

  .add-btn {
    position: absolute;
    right: 10px;
    bottom: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: @primary-color;
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