<template>
  <div class="report-list">
    <div class="report-item" v-for="item in list" :key="item.id" @click="onClick(item)">
      <img class="img" :src="item.icon" alt="#" />
      <span class="name">{{ item.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import { addReportCount } from '@/api/app'
import { sessionStorageKeys } from '@/logics/enums/cache'

interface ReportItem {
  id: number
  name: string
  icon: string
  bi_url: string
}

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<ReportItem[]>,
      default: () => []
    }
  },

  setup() {
    const router = useRouter()
    const onClick = async (item: any) => {
      const toast = Toast.loading({ message: '加载报表...', duration: 0 })
      try {
        await addReportCount(item.id)
        toast.clear()
        sessionStorage.setItem(sessionStorageKeys.reportData, JSON.stringify(item))
        router.push(`/report/${item.id}`)
      } catch (e) {
        toast.clear()
      }
    }

    return {
      onClick
    }
  }
})
</script>

<style lang="less" scoped>
.report-list {
  .report-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebedf0;
    padding: 10px 0px;
    font-size: 13px;
    color: @ins-text-color-light-1;
    &:last-child {
      border-bottom: none;
    }
    .img {
      width: 22px;
      height: 22px;
      margin-right: 8px;
    }
  }
}
</style>
