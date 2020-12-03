<template>
  <div class="dashboard-page">
    <div class="card header">
      <van-image :src="user.avatar" width="60" height="60" fit="cover" round />
      <div class="info">
        <p class="name">{{ greet.greeting }}, {{ user.nickname }}</p>
        <p class="time">{{ greet.week }}</p>
      </div>
      <div class="icon" @click="onGotoFlow('returned')">
        <img src="@assets/img/flow-send.png">
        <span>我发起的</span> 
      </div>
    </div>
    <div class="flow">
      <div class="card approval" @click="onGotoFlow('willApproval')">
        <img src="@assets/img/will-approval.png">
        <span class="text">待我审批</span>
        <span class="num">{{ willApproval }}</span>
      </div>
      <div class="card consult" @click="onGotoFlow('willConsult')">
        <img src="@assets/img/will-consult.png">
        <span class="text">待我查阅</span>
        <span class="num">{{ willConsult }}</span>
      </div>
    </div>
    <div class="card usually">
      <div class="title">
        <span class="label">常用</span>
        <span class="more" @click="$router.push('/market')">全部应用</span>
        <van-icon name="arrow" color="#c8c9cc"/>
      </div>
      <AppList :app-data="appData" v-if="appData.length"/>
      <p v-else class="no-data">暂无数据</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, toRefs, computed, onMounted, onActivated } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { fetchFlowNum } from '@/api/workflow'
import { fetchUsuallyApp } from '@/api/app'
import AppList from '@/components/app-list/AppList.vue'

export default defineComponent({
  components: {
    AppList
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const state = reactive({
      willConsult: 0,
      willApproval: 0
    })
    const greet = useGreet()
    const { appData } = useUsually()
    
    const onGotoFlow = (type: string) => {
      router.push({
        path: '/workflow',
        query: {
          type: type
        }
      })
    }

    onMounted(async () => {
      const res = await fetchFlowNum()
      if(res.ret === 0) {
        state.willConsult = res.data.willConsult
        state.willApproval = res.data.willApproval
      }
    })

    return {
      ...toRefs(state),
      user: computed(() => store.state.user),
      greet,
      appData,
      onGotoFlow
    }
  }
})

function useGreet() {
  const date = new Date()
  const hours = date.getHours()

  let greeting;
  if(hours >= 5 && hours < 11) greeting = '早上好'
  else if(hours >= 11 && hours < 13) greeting = '中午好'
  else if(hours >= 13 && hours < 19) greeting = '下午好'
  else greeting = '晚上好'

  let week;
  switch(date.getDay()) {
    case 0: week = '周日'; break;
    case 1: week = '周一'; break; 
    case 2: week = '周二'; break;
    case 3: week = '周三'; break;
    case 4: week = '周四'; break;
    case 5: week = '周五'; break;
    case 6: week = '周六'; break;
  }

  return {
    greeting,
    week: `${date.getMonth()+1}月${date.getDate()}日, ${week}`
  }
}

function useUsually() {
  const appData = ref([])
  const fetch = async () => {
    const res = await fetchUsuallyApp()
    if(res.ret === 0) {
      appData.value = res.data
    }
  }
  onMounted(() => fetch())
  onActivated(() => fetch())

  return {
    appData
  }
}

</script>

<style lang="less" scoped>
.dashboard-page {
  padding: 10px;
  .header {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: @text-color-light-2;
    margin-bottom: 10px;
    .info {
      flex: 1;
      margin: 0px 10px;
      border-right: 1px solid #eee;
      .name {
        font-size: 16px;
        color: @text-color;
        margin-bottom: 10px;
      }
    }
    .icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 20px;
        height: 20px;
        margin-bottom: 6px;
      }
    }
  }
  .flow {
    display: flex;
    .card {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 110px;
      &.approval {
        margin-right: 5px;
      }
      &.consult {
        margin-left: 5px;
      }
      img {
        width: 35px;
        height: 35px;
      }
      .text {
        font-size: 13px;
        color: @text-color-light-1;
        padding: 6px 0px;
      }
      .num {
        font-size: 18px;
        font-weight: 500;
      }
    }
  }
  .usually {
    margin-top: 10px;
    .title {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .label {
        flex: 1;
        font-weight: 500;
        padding-left: 6px;
        border-left: 2px solid @primary-color;
        line-height: 16px;
      }
      .more {
        font-size: 13px;
        color: @text-color-light-2;
      }
    }
    .no-data {
      text-align: center;
      color: @text-color-light-2;
      font-size: 12px;
      padding: 10px 0px;
    }
  }
}
</style>