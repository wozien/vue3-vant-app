import { find } from 'lodash-es'
import { defineComponent, ref, watchEffect, computed, Ref } from 'vue'
import { useStore } from '@/store'
import { getApp } from '@/logics/class/App'
import { Fields } from '@/logics/types'
import ViewItem from '@/logics/class/ViewItem'
import { uuid } from '@/utils/helper'
import { findDataPoint, getEvalContext } from '@/logics/core/dataPoint'
import FormField from '@/views/form/FormField.vue'
import useExpose from '@/hooks/core/useExpose'


export default defineComponent({
  components: {
    FormField,
  },

  props: {
    flexFields: {
      type: Array,
      default: () => []
    }
  },

  setup(props) {
    const store = useStore()
    const items = ref<(ViewItem | null)[]>([])
    const curRecord = computed(() => store.getters.curRecord)
    const fields = getFields(curRecord.value.model as string) as Fields
    let FieldCompRefs: Ref<any>[] = []

    watchEffect(() => {
      if(props.flexFields.length) {
        items.value = props.flexFields.map((f: any) => {
          const field = fields[f.name]
          if(field) {
            const item = {
              key: uuid(),
              string: f.string,
              fieldType: f.type,
              fieldKey: field.key,
              domain: [],
              items: []
            } as any
            item.widget = item.placeholder = ''
            return new ViewItem(item)
          }
          return null
        })

        // 更新m2o弹性字段的domain
        const record = findDataPoint(curRecord.value.id)
        if(record) {
          const fieldsInfo = record.fieldsInfo
          props.flexFields.forEach((f: any) => {
            if(f.type === 'many2one' || f.type === 'reference') {
              const field = fieldsInfo[f.name]
              if(field && f.domain.length > 3) {
                field.domain = f.domain
              }
            }
          })
        }
      }
    })

    const getChanges = () => {
      const names = [] as any
      const flex = {} as any
      const evalContext = getEvalContext(curRecord.value.id)
      items.value.forEach((item: any, index: number) => {
        const compRef = FieldCompRefs[index]
        if(item && compRef.value && compRef.value.isSet()) {
          const field = find(fields, (f: any) => f.key === item.fieldKey)
          if(field) {
            flex[field.name] = evalContext[field.name]
          }
          names.push(`${compRef.value.string}:${compRef.value.value}`)
        }
      })
      return {
        flex,
        names: names.join('/')
      }
    }
    useExpose({ getChanges })

    const renderItems = () => {
      const templates = [] as any
      FieldCompRefs = []
      items.value.forEach((item: ViewItem|null) => {
        if(item) {
          const field = find(fields, (f: any) => f.key === item.fieldKey)
          const compRef = ref(null)
          FieldCompRefs.push(compRef)
          templates.push(
            <FormField item={item} field={field} mode="edit" ref={compRef}/>
          )
        }
      })
      return templates
    }

    return () => (<div class="flex-form">{ renderItems() }</div>)
  }
})

function getFields(modelKey: string) {
  const curApp = getApp()
  const curModel = curApp.getModel(modelKey)
  return curModel && curModel.getFields()
}
