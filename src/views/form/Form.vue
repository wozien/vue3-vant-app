<template>
  <Page name="form-view">
    <div class="header" v-show="$route.query.readonly == 1"></div>
    <div class="form-canvas">
      <FormCanvas />
    </div>
    <div class="button-wrapper"></div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue'
import { App, Record, Item, Field } from '@/assets/js/class'
// import { useRoute } from 'vue-router'
import FormCanvas from './FormCanvas'

export default defineComponent({
  components: {
    FormCanvas
  },

  props: {
    viewFields: {
      type: Array as PropType<Field[]>
    }
  },

  setup(props) {
    // const route = useRoute()
    const record = ref<Record | null>(null)
    const searchFields = computed(() => {
      let res: string[] = []
      if(props.viewFields?.length) {
        for(let field of props.viewFields) {
          if(field && field.name) res.push(field.name)
        }
      }
      return res
    })

    return {
      record,
      searchFields
    }
  }
})


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getContext(curApp: App) {
  const curView = curApp.getView('form')
  const curModel = curApp.getModel()
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
    curView,
    curModel,
    viewFields: fields
  }
}
</script>

<style lang="less" scoped>
.ins-form-view-page {
  .header {
    height: 60px;
    background: #fff
  }
  .form-canvas {
    height: calc(100vh - 110px);
  }
  .button-wrapper {
    height: 50px;
    background: #fff;
  }
}
</style>