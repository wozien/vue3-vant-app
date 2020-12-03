<template>
  <Page name="workflow-view">
    <van-tabs v-model:active="active">
      <van-tab v-for="item in group.types" 
        :key="item.type" 
        :title="item.title"
        :name="item.type"/>
    </van-tabs>

    <div class="list-container"></div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'

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
  setup() {
    const route = useRoute()
    const router = useRouter()
    const state = reactive({
      active: route.query.type,
      group: calcGroup(route.query.type as string)
    })

    watch(() => state.active, (val) => {
      router.push({
        path: '/workflow',
        query: {
          type: val
        }
      })
    })
    
    return {
      ...toRefs(state)
    }
  }
})

function calcGroup(type: string) {
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
  return group;
}

</script>

<style lang="less" scoped>
.list-container {
  height: calc(100vh - 44px);
}
</style>