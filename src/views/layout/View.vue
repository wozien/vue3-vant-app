<template>
  <ListView
    v-if="viewType === 'list'" 
    :app-name="ctx && ctx.appName"
    :field-info="ctx && ctx.fieldInfo"
  />
  <FormView v-else
    :field-info="ctx && ctx.fieldInfo"
    :fields="ctx && ctx.fields"
    :cur-view="ctx && ctx.curView"
  />
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount, computed } from 'vue'
import { App, getAppAsync, ViewType, Field, Item } from '@/assets/js/class'
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
  const viewFields: Field[] = []
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
  const fieldsInfo = curApp.fieldsInfo
  
  if(curView && curModel) {
    getViewFields(curView.items, viewFields)
  }

  return {
    appName: curApp.name,
    curModel,
    curView,
    viewFields: viewFields,
    fields: curModel && curModel.getFields() || {},
    fieldInfo: fieldsInfo && fieldsInfo[viewType] || {}
  }
}
</script>

<style lang="less" scoped></style>