<template>
  <Loading v-model:show="loading" v-if="loading"/>
  <van-empty v-else-if="ctx && !ctx.curView" :description="`移动${viewName}视图不存在`"/>
  <ListView 
    v-else-if="viewType === 'list'" 
    :app-name="ctx && ctx.appName"
    :fields-info="ctx && ctx.fieldsInfo"
    :fields="ctx && ctx.fields"
    :cur-view="ctx && ctx.curView"
    :action="ctx && ctx.action"
  />
  <FormView v-else
    :fields-info="ctx && ctx.fieldsInfo"
    :fields="ctx && ctx.fields"
    :cur-view="ctx && ctx.curView"
  />
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, computed, watchEffect } from 'vue'
import { Model, View, ViewType, Fields, FieldsInfo, Action } from '@/logics/types'
import App, { getAppAsync } from '@/logics/class/App'
import { useRoute } from 'vue-router'
import { Toast } from 'vant'
import useTitle from '@/hooks/web/useTitle'
import ListView from '../list/List.vue'
import FormView from '../form/Form.vue'
import { sessionStorageKeys } from '@/logics/enums/cache'

interface ViewContext {
  appName: string
  curModel: Model
  curView: View
  fields: Fields
  fieldsInfo: FieldsInfo,
  action?: Action
}

export default defineComponent({
  components: {
    ListView,
    FormView
  },
  
  setup() {
    const route = useRoute()
    
    const curApp = ref<App>(new App('', '', 0))
    const ctx = ref<ViewContext>()
    const loading = ref(true)
    const title = computed(() => {
      return curApp.value.name || '应用'
    })
    const viewName = computed(() => {
      return route.query.viewType === 'form' ? '表单' : '列表'
    })
    useTitle(title)

    onBeforeMount(async () => {
      let loadParams = JSON.parse(sessionStorage.getItem(sessionStorageKeys.loadParams) || '{}')
      let { menuId, actionId } = loadParams
      const res = await getAppAsync(route.query.model as string , menuId as string, actionId as string)
      curApp.value = res
      loading.value = false
    })

    watchEffect(() => {
      if(curApp.value.isLoaded && route.query.model) {
        let { model, viewType } = route.query
        model = route.query.subModel || model
        ctx.value = getContext(curApp.value as App, model as string, viewType as ViewType)
        if(!ctx.value.curView) {
          Toast(`移动${viewName.value}视图不存在，请前往设计器同步发布移动视图`)
        }
      }
    })

    return {
      loading,
      curApp,
      viewType: computed(() => route.query.viewType),
      viewName,
      ctx
    }
  }
})

function getContext(curApp: App, modelKey: string, viewType: ViewType): ViewContext {
  const curView = curApp.getView(viewType, modelKey) as View
  const curModel = curApp.getModel(modelKey) as Model
  const fieldsInfo = curApp.fieldsInfo?.[viewType]

  return {
    curModel,
    curView,
    appName: curApp.name,
    fields: curModel && curModel.getFields() || {},
    fieldsInfo: fieldsInfo || {},
    action: curApp.action
  }
}
</script>

<style lang="less" scoped></style>