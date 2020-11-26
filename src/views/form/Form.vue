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
import { defineComponent, ref, computed, PropType, watch } from 'vue'
import { Record, Field } from '@/assets/js/class'
import { useRoute } from 'vue-router'
import FormCanvas from './FormCanvas'
import { fetchRecord } from '@/api/app'

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
    const route = useRoute()
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

    watch(searchFields, async (val) => {
      if(val.length) {
        const { model, id } = route.query
        if(model && id) {
          const res = await fetchRecord(model as string, (+id) as number, val)
          record.value = new Record(res.data)
        }
      }
    })

    return {
      record,
      searchFields
    }
  }
})

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