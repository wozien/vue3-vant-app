<template>
  <div class="market">
    <van-search v-model="searchValue" shape="round" placeholder="搜索应用"></van-search>
    <div class="market-wrapper" v-if="filterList.length">
      <div v-for="item in filterList" :key="item.key" class="market-item van-hairline--top">
        <span class="label">{{ item.name }}</span>
        <AppList :app-data="item.apps" />
      </div>
    </div>
    <van-empty v-else description="暂无搜索结果" image="search"></van-empty>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent, ref, onBeforeMount, watchEffect } from 'vue'
import AppList from '@/components/app-list/AppList.vue'
import { fetchAppData } from '@/api/app'

export default defineComponent({
  components: {
    AppList
  },

  setup() {
    const searchValue = ref('')
    const list = ref<any[]>([])
    const filterList = ref<any[]>([])

    onBeforeMount(async () => {
      const res = await fetchAppData()
      if(res.ret === 0) {
        list.value = res.data.filter((item:any) => item.apps.length)
      }
    })

    watchEffect(() => {
      if(list.value.length) {
        let res: any
        if(!searchValue.value) {
          res = list.value.slice(0)
        } else {
          res = []
          for(let item of list.value) {
            const apps = item.apps.filter((app: any) => app.name.includes(searchValue.value))
            if(apps.length) {
              res.push(_.defaults({ apps }, item))
            }
          }
        }
        filterList.value = res
      }
    })

    return {
      searchValue,
      list,
      filterList
    }
  }
})
</script>

<style lang="less" scoped>
.market {
  background: #fff;
  .market-wrapper {
    height: calc(100vh - 104px);
    overflow: auto;
    .market-item {
      padding: 10px 20px;
      .label {
        display: block;
        font-size: 14px;
        line-height: 14px;
        padding-left: 8px;
        margin: 10px 0px;
        border-left: 2px solid @primary-color;
      }
    }
  }
}
</style>