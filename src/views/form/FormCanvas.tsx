import { find } from 'lodash-es'
import { defineComponent, PropType } from 'vue'
import { useRoute } from 'vue-router'
import { Item, Fields, Field } from '@/logics/types'
import FormGroup from './FormGroup.vue'
import FormField from './FormField.vue'
import FormNotebook from './FormNotebook'
import FlexDrop from '@/components/flex/FlexDrop.vue'
import { sessionStorageKeys } from '@/logics/enums/cache'

type WidgetMode = 'readonly' | 'edit'

const FormCanvas = defineComponent({
  components: {
    FormGroup,
    FormField,
    FormNotebook,
    FlexDrop
  },

  props: {
    items: Array as PropType<Item[]>,
    fields: Object as PropType<Fields>,
    isVirtual: Boolean
  },

  setup(props) {
    const route = useRoute()

    const renderItem = (item: Item, mode: WidgetMode) => {
      const items = item.items
      const field = find(props.fields, (field: Field) => {
        return field.key === item.fieldKey || field.name === item.fieldKey
      })

      switch (item.widget) {
        case 'statusbar':
          return null
        case 'div':
        case 'group':
        case 'page':
          return (
            <FormGroup renderItem={item} type={item.widget}>
              {items.length ? renderItems(items, mode) : null}
            </FormGroup>
          )
        case 'notebook':
          return (
            <FormNotebook renderItem={item}>
              {items.length ? renderItems(items, mode) : null}
            </FormNotebook>
          )
        default:
          if (field && item) {
            return (
              <FormField
                item={item}
                field={field}
                mode={mode}
                key={item.key}
                is-virtual={props.isVirtual}
              />
            )
          } else {
            return null
          }
      }
    }

    const renderItems = (items: Item[], mode: WidgetMode) => {
      if (items?.length) {
        const template = items.map(item => renderItem(item, mode))
        return template
      }
    }

    return () => {
      let mode = (route.query.readonly as string) === '1' ? 'readonly' : 'edit'

      // x2m 字段的状态会影响整个视图
      const command = JSON.parse(sessionStorage.getItem(sessionStorageKeys.x2manyCommand) || '{}')
      if (command.type && command.isReadonly) {
        mode = 'readonly'
      }
      return renderItems(props.items!, mode as WidgetMode)
    }
  }
})

export default FormCanvas
