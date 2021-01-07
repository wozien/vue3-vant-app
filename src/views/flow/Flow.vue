<template>
  <Page name="workflow-view">
    <van-tabs v-model:active="active">
      <van-tab v-for="item in group.types" 
        :key="item.type" 
        :title="item.title"
        :name="item.type"/>
    </van-tabs>

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
            :record="item"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </Page>
</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent, computed, reactive, toRefs, watch, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore, User } from '@/store'
import { fetchFlowList } from '@/api/workflow'
import { formatDate, str2Date } from '@/assets/js/utils/date'
import { setDocumentTitle } from '@/assets/js/hooks/use-title'
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
    const { listState, onLoad, onRefresh } = useList(searchType, user)

    return {
      group,
      searchType,
      active,
      ...toRefs(listState),
      onLoad,
      onRefresh
    }
  }
})

/**
 * 计算对应的流程组信息
 */
function useGroup(type: string) {
  let group;
  for(let key in FLOW_TYPES) {
    const types = FLOW_TYPES[key as GROUP_TYPE]
    if(_.find(types, { type })) {
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
    loading: false,
    finished: false,
    refreshing: false
  })

  const onLoad = async () => {
    if(user.value.phone && searchType.value) {
      const res = await fetchFlowList(searchType.value, user.value.phone, state.offset)
      if(res.ret === 0) {
        let rows = res.data?.auditList?.rows || []
        if(rows.length) {
          state.list = state.list.concat(toListCardData(rows))
          state.offset = state.list.length
        } 

        if(!rows.length || rows.length < 10) {
          state.finished = true
        }
      }
    }
    state.loading = false
    state.refreshing = false
  }

  const onRefresh = () => {
    state.finished = false
    state.list = []
    state.loading = true
    state.offset = 0
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
        createImg: '/img/avatar.png',
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
    onLoad,
    onRefresh
  }
}

</script>

<style lang="less" scoped>
.list-container {
  height: calc(100vh - 44px);
}
</style>