<template>
  <div class="page dashboard-page">
    <div class="dashboard">
      <div class="header">
        <van-image :src="user.avatar" width="60" height="60" fit="cover" round />
        <div class="info">
          <p class="name">{{ greet.greeting }}, {{ user.nickname }}</p>
          <p class="time">{{ greet.week }}</p>
        </div>
        <div class="icon" @click="onGotoFlow('returned')">
          <img src="@/assets/img/flow-send.png" />
          <span>我发起的</span>
        </div>
      </div>
      <div class="flow">
        <div class="flow-item approval" @click="onGotoFlow('willApproval')">
          <img src="@/assets/img/will-approval.png" />
          <span class="text">待我审批</span>
          <span class="num">{{ willApproval }}</span>
        </div>
        <div class="flow-item consult" @click="onGotoFlow('willConsult')">
          <img src="@/assets/img/will-consult.png" />
          <span class="text">待我查阅</span>
          <span class="num">{{ willConsult }}</span>
        </div>
      </div>
      <div class="usually">
        <div class="title">
          <span class="label">常用</span>
          <span class="more" @click="$router.push('/market')">全部应用</span>
          <van-icon name="arrow" color="#c8c9cc" />
        </div>
        <AppList :app-data="appData" v-if="appData.length" />
        <p v-else class="no-data">暂无数据</p>
      </div>
      <div class="usually">
        <div class="title">
          <span class="label">报表</span>
          <span class="more" @click="$router.push('/report')">全部报表</span>
          <van-icon name="arrow" color="#c8c9cc" />
        </div>
        <ReportList :list="reportData" v-if="reportData.length" />
        <p v-else class="no-data">暂无数据</p>
      </div>
    </div>

    <TabBar active="dashboard" />

    <!-- <div class="camera-btn">
      <van-uploader capture="camera" :after-read="onCameraScan">
        <i class="ins-icon ins-icon-camera" />
      </van-uploader>
    </div> -->

    <!-- <Modal v-model:show="showScanModal" :hideCancel="true" @confirm="onCameraConfirm">
      <van-empty description="暂无识别匹配结果" v-if="!scanList.length"></van-empty>
      <p class="scan-result-count" v-if="scanList.length">
        {{ `我们为您找到了${scanList.length}个相似的商品` }}
      </p>
      <div class="scan-list">
        <div
          class="scan-list-item"
          v-for="(item, index) in scanList"
          :key="index"
          @click="previewImages(index)"
        >
          <img :src="item.url" class="scan-result" />
          <span class="scan-simi" :class="item.similarity < 65 && 'lower'">{{
            `${item.similarity}%相似`
          }}</span>
        </div>
      </div>
    </Modal> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, toRefs, computed, onActivated, nextTick } from 'vue'
import { useStore } from '@/store'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { fetchFlowNum } from '@/api/workflow'
import { fetchUsuallyApp, fetchUsuallyReport } from '@/api/app'
import { imageSearch } from '@/api/system'
import AppList from '@/components/app-list/AppList.vue'
import ReportList from '@/components/app-list/ReportList.vue'
import TabBar from '@/components/tabbar/TabBar.vue'
import useTitle from '@/hooks/web/useTitle'
import useToast from '@/hooks/component/useToast'
import { ImagePreview } from 'vant'
import { log } from '@/utils'

export default defineComponent({
  components: {
    AppList,
    ReportList,
    TabBar
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const state = reactive({
      willConsult: 0,
      willApproval: 0
    })
    const greet = useGreet()
    const { appData, reportData } = useUsually()
    const { showScanModal, scanList, onCameraScan, onCameraConfirm, previewImages } = useCamera()

    const onGotoFlow = (type: string) => {
      router.push({
        path: '/workflow',
        query: {
          type: type
        }
      })
    }

    onActivated(async () => {
      const res = await fetchFlowNum()
      if (res.ret === 0) {
        state.willConsult = res.data.willConsult
        state.willApproval = res.data.willApproval
      }
    })

    return {
      ...toRefs(state),
      user: computed(() => store.state.user),
      greet,
      appData,
      reportData,
      scanList,
      showScanModal,
      onGotoFlow,
      onCameraScan,
      onCameraConfirm,
      previewImages
    }
  }
})

function useGreet() {
  const date = new Date()
  const hours = date.getHours()

  let greeting
  if (hours >= 5 && hours < 11) greeting = '早上好'
  else if (hours >= 11 && hours < 13) greeting = '中午好'
  else if (hours >= 13 && hours < 19) greeting = '下午好'
  else greeting = '晚上好'

  let week
  switch (date.getDay()) {
    case 0:
      week = '周日'
      break
    case 1:
      week = '周一'
      break
    case 2:
      week = '周二'
      break
    case 3:
      week = '周三'
      break
    case 4:
      week = '周四'
      break
    case 5:
      week = '周五'
      break
    case 6:
      week = '周六'
      break
  }

  return {
    greeting,
    week: `${date.getMonth() + 1}月${date.getDate()}日, ${week}`
  }
}

function useUsually() {
  const appData = ref([])
  const reportData = ref([])
  const fetch = async () => {
    try {
      const [resA, resR] = await Promise.all([fetchUsuallyApp(), fetchUsuallyReport()])
      if (resA.ret === 0 && resR.ret === 0) {
        appData.value = resA.data
        reportData.value = resR.data
      }
    } catch (e) {
      //
    }
  }
  onActivated(() => fetch())

  return {
    appData,
    reportData
  }
}

function useCamera() {
  const { toast } = useToast()
  const oldTitle = document.title
  const showScanModal = ref(false)
  const scanList = ref<any[]>([])
  const title = useTitle(oldTitle)

  const onCameraScan = async (data: any) => {
    const file = data.file as File
    scanList.value = []

    if (file) {
      toast.loading('正在识别...')
      try {
        const res = await imageSearch(file)
        if (res.ret === 0) {
          showScanModal.value = true
          scanList.value = res.data || []
          nextTick(() => {
            title.value = '识别结果'
          })
        }
      } catch (e) {
        log(e)
      } finally {
        toast.clear()
      }
    }
  }

  const onCameraConfirm = (cb: Fn) => {
    title.value = oldTitle
    cb()
  }

  const previewImages = (index = 0) => {
    const images = scanList.value.map(item => item.url as string)
    ImagePreview(images, index)
  }

  onBeforeRouteLeave(() => {
    showScanModal.value = false
  })

  return {
    showScanModal,
    scanList,
    onCameraScan,
    onCameraConfirm,
    previewImages
  }
}
</script>

<style lang="less" scoped>
.dashboard {
  height: calc(100% - 50px);
  padding: 10px;
  .header {
    .card;
    display: flex;
    align-items: center;
    font-size: 13px;
    color: @ins-text-color-light-2;
    margin-bottom: 10px;
    .info {
      flex: 1;
      margin: 0px 10px;
      border-right: 1px solid #eee;
      .name {
        font-size: 16px;
        color: @ins-text-color;
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
    .flow-item {
      .card;
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
        color: @ins-text-color-light-1;
        padding: 6px 0px;
      }
      .num {
        font-size: 18px;
        font-weight: 500;
      }
    }
  }
  .usually {
    .card;
    margin-top: 10px;
    .title {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .label {
        flex: 1;
        font-weight: 500;
        padding-left: 6px;
        border-left: 2px solid @ins-primary-color;
        line-height: 16px;
      }
      .more {
        font-size: 13px;
        color: @ins-text-color-light-2;
      }
    }
    .no-data {
      text-align: center;
      color: @ins-text-color-light-2;
      font-size: 12px;
      padding: 10px 0px;
    }
  }
}
.camera-btn {
  .float-btn;
  bottom: 70px;
  .ins-icon {
    font-size: 22px;
  }
}

.scan-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 10px;
  &-item {
    position: relative;
    flex: 0 0 150px;
    width: 150px;
    height: 200px;
    margin: 10px;
    border-radius: 4px;
    overflow: hidden;
    .scan-result {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .scan-simi {
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 4px 10px;
      font-size: 12px;
      color: #fff;
      background-color: rgba(7, 193, 96, 0.7);
      &.lower {
        background-color: rgba(237, 106, 12, 0.7);
      }
    }
  }
}

.scan-result-count {
  .tip-text;
  text-align: center;
  padding-top: 15px;
}
</style>
