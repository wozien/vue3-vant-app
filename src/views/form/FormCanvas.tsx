import { defineComponent, PropType }  from 'vue'
import { Item } from '@/assets/js/class'
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
    items: Array as PropType<Item[]>
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
          return (
            <FormField renderItem={item}/>
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