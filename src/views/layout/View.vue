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
import { defineComponent, ref, onBeforeMount, computed } from 'vue'
import { App, getAppAsync, ViewType } from '@/assets/js/class'
import { useRoute } from 'vue-router'
import useTitle from '@/assets/js/hooks/use-title'
import ListView from '../list/List.vue'
import FormView from '../form/Form.vue'

export default defineComponent({
  components: {
    ListView,
    FormView
  },
  
  setup() {
    const route = useRoute()
    const { menuId, actionId, model } = route.query
    let curApp = ref<App>(new App('', '', 0))
    let ctx = computed(() => {
      if(curApp.value && curApp.value.isLoaded) {
        return getContext(
          curApp.value as App,
          route.query.model as string, 
          route.query.viewType as ViewType
        )
      }
    })
    const title = computed(() => {
      return curApp.value.name || '应用'
    })
    useTitle(title)

    onBeforeMount(async () => {
      const res = await getAppAsync(model as string, menuId as string, actionId as string)
      curApp.value = res
    })

    return {
      curApp,
      viewType: computed(() => route.query.viewType),
      ctx
    }
  }
})

function getContext(curApp: App, modelKey: string, viewType: ViewType) {
  const curView = curApp.getView(viewType)
  const curModel = curApp.getModel(modelKey)
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