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
        <ListCard v-for="item in list"
          :key="item.id" 
          :app-name="ctx.appName" 
          :record="item" 
          :view-fields="ctx.viewFields"
        />
      </van-list>
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, PropType, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ListCard from './ListCard.vue'
import { App, Record } from '@/assets/js/class'
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
      list: [] as Record[]
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
        const res = await fetchListData(model as string, lastId, searchFields)
        state.loading = false
        if(res.ret === 0) {
          if(res.data.length) {
            res.data.forEach((raw: any, index: number) => {
              const record = new Record(raw)
              state.list.push(record)
              if(index === res.data.length - 1) lastId = record.id
            });
          } else {
            state.finished = true
          }
        } else {
          // TODO state.error = true
        }
        
      }
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
    appName: curApp.name,
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