<template>
  <ListView
    v-if="viewType === 'list'" 
    :view-fields="ctx && ctx.viewFields" 
    :app-name="ctx && ctx.appName"
  />
  <FormView v-else
    :view-fields="ctx && ctx.viewFields"
    :cur-view="ctx && ctx.curView"
    :cur-model="ctx && ctx.curModel"
  />
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, computed } from 'vue'
import { App, getAppAsync, ViewType, Field, Item } from '@/assets/js/class'
import { useRoute } from 'vue-router'
import { useTitle } from '@vueuse/core'
import ListView from '../list/List.vue'
import FormView from '../form/Form.vue'

export default defineComponent({
  components: {
    ListView,
    FormView
  },
  
  setup() {
    const route = useRoute()
    const { appId, actionId, model } = route.query
    let curApp = ref<App>(new App(0, 0, ''))
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
      return curApp.value.name
    })
    useTitle(title)

    onBeforeMount(async () => {
      const res = await getAppAsync(appId as string, actionId as string, model as string)
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
  const fields: Field[] = []
  const getViewFields = (items: Item[] = [], res: Field[] = []) => {
    for(let item of items) {
      if(item.isContainer) {
        item.items.length && getViewFields(item.items, res)
      } else {
        const field = (curModel as any).getField(item.fieldKey)
        if(field !== undefined) {
          res.push(field)
        }
      }
    }
  }
  
  if(curView && curModel) {
    getViewFields(curView.items, fields)
  }

  return {
    appName: curApp.name,
    curModel,
    curView,
    viewFields: fields
  }
}
</script>

<style lang="less" scoped></style>