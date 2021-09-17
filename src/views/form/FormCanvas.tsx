import { find } from 'lodash-es'
import { defineComponent, PropType } from 'vue'
import { useRoute } from 'vue-router'
import { Item, Fields, Field } from '@/logics/types'
import FormGroup from './FormGroup.vue'
import FormField from './FormField.vue'
import FormNotebook from './FormNotebook'
import FlexDrop from '@/components/flex/FlexDrop.vue'

const FormCanvas = defineComponent({
  components: {
    FormGroup,
    FormField,
    FormNotebook,
    FlexDrop
  },

  props: {
    items: Array as PropType<Item[]>,
    fields: Object as PropType<Fields>
  },

  setup(props) {
    const route = useRoute()

    const renderItem = (item: Item) => {
      const items = item.items
      const field = find(props.fields, (field: Field) => {
        return field.key === item.fieldKey || field.name === item.fieldKey
      })
      const mode = (route.query.readonly as string) === '1' ? 'readonly' : 'edit'

      switch (item.widget) {
        case 'statusbar':
        case 'div':
          return null
        case 'group':
        case 'page':
          return (
            <FormGroup renderItem={item} type={item.widget}>
              {items.length ? renderItems(items) : null}
            </FormGroup>
          )
        case 'notebook':
          return (
            <FormNotebook renderItem={item}>
              {items.length ? renderItems(items) : null}
            </FormNotebook>
          )
        default:
          if (field && item) {
            return <FormField item={item} field={field} mode={mode} key={item.key} />
          } else {
            return null
          }
      }
    }

    const renderItems = (items?: Item[]) => {
      if (items?.length) {
        const template = items.map(item => renderItem(item))
        return template
      }
    }

    return () => renderItems(props.items)
  }
})

export default FormCanvas
