<template>
  <Page name="list-view">
    <van-search v-model="searchValue" shape="round" placeholder="请输入编号搜索" show-action>
      <template #action>
        <Icon name="filter" />
      </template>
    </van-search>

    <div class="list-container">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <ListCard v-for="item in list" :key="item.id" :record-raw="item"></ListCard>
      </van-list>
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import ListCard from './ListCard.vue'
import { RecordRaw } from '@/assets/js/class/Record'

export default defineComponent({
  components: {
    ListCard
  },

  setup() {
    const state = reactive({
      searchValue: '',
      loading: false,
      finished: false,
      list: [] as RecordRaw[]
    })

    const onLoad = () => {
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          state.list.push({
            id: i
          });
        }

        state.loading = false

        if(state.list.length >= 40) {
          state.finished = true
        }
      }, 1000);
    }

    return {
      ...toRefs(state),
      onLoad
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