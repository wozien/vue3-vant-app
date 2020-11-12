<template>
  <div class="dashboard-page">
    <div class="card header">
      <van-image :src="user.avatar" width="60" height="60" fit="cover" round />
      <div class="info">
        <p class="name">晚上好, {{ user.nickname }}</p>
        <p class="time">10月22号, 周四</p>
      </div>
      <div class="icon">
        <img src="@assets/img/flow-send.png">
        <span>我发起的</span> 
      </div>
    </div>
    <div class="flow">
      <div class="card approval">
        <img src="@assets/img/will-approval.png">
        <span class="text">待我审批</span>
        <span class="num">{{ willApproval }}</span>
      </div>
      <div class="card consult">
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
      <AppList :app-data="appData" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import { fetchFlowNum } from '@/api/workflow'
import AppList from '@/components/app-list/AppList.vue'

const appData = [
  { id: 1, icon: '/img/app-icon.png', name: '报销' },
  { id: 2, icon: '/img/app-icon.png', name: '报销' },
  { id: 3, icon: '/img/app-icon.png', name: '报销' },
  { id: 4, icon: '/img/app-icon.png', name: '报销' }
]

export default defineComponent({
  components: {
    AppList
  },

  setup() {
    const state = reactive({
      willConsult: 0,
      willApproval: 0
    })
    const store = useStore()

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
      appData
    }
  }
})
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
  }
}
</style>