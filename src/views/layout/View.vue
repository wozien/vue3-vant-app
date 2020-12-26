<template>
  <ListView
    v-if="viewType === 'list'" 
    :app-name="ctx && ctx.appName"
    :fields-info="ctx && ctx.fieldsInfo"
  />
  <FormView v-else
    :fields-info="ctx && ctx.fieldsInfo"
    :fields="ctx && ctx.fields"
    :cur-view="ctx && ctx.curView"
  />
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, computed, watchEffect } from 'vue'
import { App, getAppAsync, Model, View, ViewType, Fields, FieldsInfo } from '@/assets/js/class'
import { useRoute } from 'vue-router'
import useTitle from '@/assets/js/hooks/use-title'
import ListView from '../list/List.vue'
import FormView from '../form/Form.vue'

interface ViewContext {
  appName: string
  curModel: Model
  curView: View
  fields: Fields,
  fieldsInfo: FieldsInfo
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
    const title = computed(() => {
      return curApp.value.name || '应用'
    })
    useTitle(title)

    onBeforeMount(async () => {
      const { menuId, actionId, model } = route.query
      const res = await getAppAsync(model as string, menuId as string, actionId as string)
      curApp.value = res
    })

    watchEffect(() => {
      if(curApp.value.isLoaded && route.query.model) {
        const { model, viewType } = route.query
        ctx.value = getContext(curApp.value as App, model as string, viewType as ViewType)
      }
    })

    return {
      curApp,
      viewType: computed(() => route.query.viewType),
      ctx
    }
  }
})

function getContext(curApp: App, modelKey: string, viewType: ViewType): ViewContext {
  const curView = curApp.getView(viewType, modelKey) as View
  const curModel = curApp.getModel(modelKey) as Model
  const fieldsInfo = curApp.fieldsInfo?.[viewType]

  return {
    appName: curApp.name,
    curModel,
    curView,
    fields: curModel && curModel.getFields() || {},
    fieldsInfo: fieldsInfo || {}
  }
}
</script>

<style lang="less" scoped></style>