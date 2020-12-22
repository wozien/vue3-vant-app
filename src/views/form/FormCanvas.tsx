import _ from 'lodash'
import { defineComponent, PropType }  from 'vue'
import { useRoute } from 'vue-router'
import { Item, Record, Fields } from '@/assets/js/class'
import FormGroup from './FormGroup.vue'
import FormField from './FormField.vue'
import FormNotebook from './FormNotebook'

const FormCanvas = defineComponent({
  components: {
    FormGroup,
    FormField,
    FormNotebook
  },

  props: {
    items: Array as PropType<Item[]>,
    record: Object as PropType<Record>,
    fields: Object as PropType<Fields>
  },

  setup(props) {
    const route = useRoute()

    const renderItem = (item: Item) => {
      const items = item.items
      switch(item.widget) {
        case 'statusbar': return null
        case 'group': 
        case 'page':
          return (
            <FormGroup renderItem={item} type={item.widget}>
              { items.length ? renderItems(items) : null }
            </FormGroup>)
        case 'notebook':
          return (
            <FormNotebook renderItem={item}>
              { items.length ? renderItems(items) : null }
            </FormNotebook>
          )
        default:
          const field = _.find(props.fields, { key: item.fieldKey })
          const readonly = route.query.readonly as string === '1' ? true : false
          return (
            <FormField item={item} field={field} readonly={readonly}/>
          )
      }
    }

    const renderItems = (items?: Item[]) => {
      if(items?.length) {
        const template = items.map(item => renderItem(item))
        return template
      }
    }

    return () => {
      return renderItems(props.items)
    }
  }
})


export default FormCanvas