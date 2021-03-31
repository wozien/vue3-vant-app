<template>
  <div name="workflow-view">
    <van-tabs v-model:active="active">
      <van-tab v-for="item in group.types" 
        :key="item.type" 
        :title="item.title"
        :name="item.type"/>
    </van-tabs>

    <div class="list-container">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="showEmpty ? '' : '没有更多了'"
          @load="onLoad"
        >
          <ListCard v-for="item in list"
            :key="item.id"
            :record="item"
          />
        </van-list>
        <van-empty v-show="showEmpty" description="暂无数据"/>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script lang="ts">
import { find } from 'lodash-es'
import { defineComponent, computed, reactive, toRefs, watch, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore, User } from '@/store'
import { fetchFlowList } from '@/api/workflow'
import { formatDate, str2Date } from '@/helpers/date'
import { setDocumentTitle } from '@/hooks/web/useTitle'
import ListCard from '../list/ListCard.vue'

const FLOW_TYPES = {
  task: [
    { type: 'willApproval', title: '待审批' },
    { type: 'willConsult', title: '待查阅' },
    { type: 'approvaled', title: '已审批' }
  ],
  create: [
    { type: 'returned', title: '被退回' },
    { type: 'approvaling', title: '审批中' },
    { type: 'completed', title: '已完成' }
  ]
}

type GROUP_TYPE = keyof typeof FLOW_TYPES

export default defineComponent({
  name: 'Flow',
  components: {
    ListCard
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    const user = computed(() => store.state.user)
    const searchType = computed(() => route.query.type as string)
    const active = computed({
      get() {
        return route.query.type as string
      },
      set(val: string) {
        if(val && searchType.value && val !== searchType.value) {
          router.replace({
            name: 'flow',
            query: {
              type: val
            }
          })
        }
      }
    })
    const group = useGroup(searchType.value)
    const { listState, showEmpty, onLoad, onRefresh } = useList(searchType, user)

    return {
      group,
      searchType,
      active,
      ...toRefs(listState),
      showEmpty,
      onLoad,
      onRefresh
    }
  }
})

/**
 * 计算对应的流程组信息
 */
function useGroup(type: string) {
  let group
  for(let key in FLOW_TYPES) {
    const types = FLOW_TYPES[key as GROUP_TYPE]
    if(find(types, { type })) {
      group = {
        name: key,
        types: types
      }
    }
  }
  setDocumentTitle(group?.name === 'task' ? '我的任务' : '我的发起')
  return group
}

/**
 * 列表数据加载hook
 */
function useList(searchType: Ref<string>, user: Ref<User>) {
  const state = reactive({
    offset: 0,
    list: [],
    loading: true,
    finished: false,
    refreshing: false
  })
  const showEmpty = computed(() => {
    return state.list.length === 0 && !state.loading
  })

  const onLoad = async () => {
    if(user.value.phone && searchType.value) {
      try {
        const res = await fetchFlowList(searchType.value, user.value.phone, state.offset)
        state.loading = false
        if(res.ret === 0) {
          let rows = res.data?.auditList?.rows || []
          if(rows.length) {
            state.list = state.list.concat(toListCardData(rows))
            state.offset = state.list.length
          } 

          if(!rows.length || rows.length < 10) {
            state.finished = true
          } 
        } else {
          state.finished = true
        }
      } catch(e) {
        state.finished = true
      }
    }
  }

  const onRefresh = () => {
    // 下拉刷新会把refreshing设置为true， 会和列表同时出现两个加载中
    state.refreshing = false

    // 清空数据
    state.finished = false
    state.list = []
    state.offset = 0
    state.loading = true
    onLoad()
  }

  // 转换成卡片数据包
  const toListCardData = (rows: any) => {
    return rows.map((row: any) => {
      const date = str2Date(row.submit_date || row.accept_date || row.return_date)
      const state = row.current_auditor ? `${row.current_auditor} 审核中` : ''
      const res = {
        id: row.bill_id,
        name: row.model,
        model: row.model_id,
        state: state,
        stateType: '',
        creator: row.submit_user,
        createDate: formatDate('M月d日 hh:mm', date),
        createImg: '',
        fields: [
          { name: 'bill_number', string: '单据编号', value: row.bill_number}
        ],
        type: searchType.value,
        context: Object.assign({}, row, { type: searchType.value }),
        isFlow: true
      }

      if(res.type === 'returned') {
        // 退回显示退回原因
        res.fields.push({ name: 'return_opinion', string: '退回原因', value: row.return_opinion })
        res.creator = res.createImg = ''
        res.state = `被 ${row.return_user} 退回`
        res.stateType = 'error'
      } else {
        res.fields.push({ name: 'bill_date', string: '单据日期', value: row.bill_date })
      }

      return res
    })
  }

  watch(searchType, val => {
    val && onRefresh()
  })
  watch(user, onRefresh)

  return {
    searchType,
    listState: state,
    showEmpty,
    onLoad,
    onRefresh
  }
}

</script>

<style lang="less" scoped>
.workflow-view {
  height: 100%;
  .list-container {
    height: calc(100% - 44px);
    overflow: auto;
  }
}
</style>