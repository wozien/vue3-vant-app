import { defineComponent, PropType }  from 'vue'
import { Item, Record, Field } from '@/assets/js/class'
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
    viewFields: {
      type: Array as PropType<Field[]>,
      default: () => []
    }
  },

  setup(props) {
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
          const field = props.viewFields.find(f => f.key === item.fieldKey) as Field
          return (
            <FormField item={item} field={field} record={props.record}/>
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