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
          finished-text="没有更多了"
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
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ListCard from './ListCard.vue'
import { Record } from '@/assets/js/class'
import { viewCommonProps } from '@/assets/js/hooks/view-common'
import { fetchListData } from '@/api/app'

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

    let lastId = 0;
    const onLoad = async () => {
      if(searchFields.value.length) {      
        const res = await fetchListData(route.query.model as string, lastId, searchFields.value)
        state.loading = false
        state.refreshing = false
        if(res.ret === 0) {
          if(res.data.length) {
            res.data.forEach((raw: any, index: number) => {
              const record = new Record(raw)
              state.list.push(record)
              if(index === res.data.length - 1) lastId = record.id
            })
          } else {
            state.finished = true
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

    watch(searchFields, () => {
      onLoad()
    })

    return {
      ...toRefs(state),
      searchFields,
      onLoad,
      onRefresh
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
}
</style>