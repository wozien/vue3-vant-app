<template>
  <Page name="list-view">
    <van-search v-model="searchValue" shape="round" placeholder="请输入编号搜索" show-action>
      <template #action>
        <Icon name="filter" />
      </template>
    </van-search>

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

export default defineComponent({
  components: {
    ListCard
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
      list: [] as Record[]
    })
    const searchFields = computed(() => {
      return props.fieldsInfo ? Object.keys(props.fieldsInfo) : []
    })
    const showEmpty = computed(() => {
      return state.list.length === 0 && !state.loading
    })

    let lastId = 0;
    const onLoad = async () => {
      if(searchFields.value.length) {      
        const res = await fetchListData(route.query.model as string, lastId, searchFields.value)
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

    watch(searchFields, () => {
      onLoad()
    })

    return {
      ...toRefs(state),
      searchFields,
      showEmpty,
      onLoad,
      onRefresh,
      onAddBtn
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