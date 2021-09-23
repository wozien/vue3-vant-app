import { find, isObject } from 'lodash-es'
import { defineComponent, defineAsyncComponent, ref, watchEffect, computed } from 'vue'
import { useStore } from '@/store'
import { getApp } from '@/logics/class/App'
import { Fields } from '@/logics/types'
import ViewItem from '@/logics/class/ViewItem'
import { uuid } from '@/utils'
import { findDataPoint, getEvalContext, isSet } from '@/logics/core/dataPoint'
import useExpose from '@/hooks/core/useExpose'

const FormField = defineAsyncComponent(() => import('@/views/form/FormField.vue'))

export default defineComponent({
  components: {
    // FormField: () => import('@/views/form/FormField.vue'),
    FormField
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

    watchEffect(() => {
      if (props.flexFields.length) {
        items.value = props.flexFields.map((f: any) => {
          const field = fields[f.name]
          if (field) {
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
        if (record) {
          const fieldsInfo = record.fieldsInfo
          props.flexFields.forEach((f: any) => {
            if (f.type === 'many2one' || f.type === 'reference') {
              const field = fieldsInfo[f.name]
              if (field && f.domain.length > 3) {
                field.domain = f.domain
              }
            }
          })
        }
      }
    })

    const getChanges = () => {
      if (!curRecord.value) return {}

      const names = [] as any
      const flex = {} as any
      const { fieldsInfo, data } = curRecord.value
      const evalContext = getEvalContext(curRecord.value.id)
      items.value.forEach((item: any) => {
        if (item) {
          const field = find(fieldsInfo, (f: any) => f.fieldKey === item.fieldKey)
          if (!field) return

          let value = data[field.name]
          if (isSet({ type: field.type, value })) {
            flex[field.name] = evalContext[field.name]
            if (isObject(value)) {
              value = (value as any).data.display_name // m2o
            }
            names.push(`${field.string}:${value}`)
          }
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
      items.value.forEach((item: ViewItem | null) => {
        if (item) {
          const field = find(fields, (f: any) => f.key === item.fieldKey)
          const compRef = ref(null)
          templates.push(<FormField item={item} field={field} mode="edit" ref={compRef} />)
        }
      })
      return templates
    }

    return () => <div class="flex-form">{renderItems()}</div>
  }
})

function getFields(modelKey: string) {
  const curApp = getApp()
  const curModel = curApp.getModel(modelKey)
  return curModel && curModel.getFields()
}
