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
        <ListCard v-for="item in list" :key="item.id" :record-raw="item" :view-fields="ctx.viewFields"></ListCard>
      </van-list>
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, PropType, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ListCard from './ListCard.vue'
import { App, RecordRaw } from '@/assets/js/class'
import { fetchListData } from '@/api/app'

export default defineComponent({
  components: {
    ListCard
  },

  props: {
    curApp: {
      type: Object as PropType<App>,
      required: true
    }
  },

  setup(props) {
    const route = useRoute()
    const state = reactive({
      searchValue: '',
      loading: false,
      finished: false,
      list: [] as RecordRaw[]
    })

    const ctx = computed(() => {
      if(props.curApp.isLoaded) { 
        return getContext(props.curApp)
      }
    })

    let searchFields: string[] = []
    let lastId = 0
    watch(() => ctx.value, (val) => {
      if(val?.curModel) {
        val.viewFields.forEach(field => {
          if(field && typeof field.name === 'string') {
            searchFields.push(field.name)
          }
        })
        onLoad()
      }
    })

    const onLoad = async () => {
      if(props.curApp.isLoaded && searchFields.length) {
        const { model } = route.query
        await fetchListData(model as string, lastId, searchFields)
      }
      // setTimeout(() => {
      //   for (let i = 0; i < 10; i++) {
      //     state.list.push({
      //       id: i
      //     });
      //   }

      //   state.loading = false

      //   if(state.list.length >= 40) {
      //     state.finished = true
      //   }
      // }, 1000);
    }

    return {
      ...toRefs(state),
      ctx,
      onLoad
    }
  }
})

function getContext(curApp: App) {
  const curView = curApp.getView('list')
  const curModel = curApp.getModel()
  const fields = []
  if(curView && curModel) {
    for(let item of curView.items) {
      const field = curModel.getField(item.fieldKey)
      fields && fields.push(field)
    }
  }

  return {
    curModel,
    curView,
    viewFields: fields
  }
}

</script>

<style lang="less" scoped>
.ins-list-view-page {
  .list-container {
    height: calc(100vh - 56px);
    overflow: auto;
  }
}
</style>