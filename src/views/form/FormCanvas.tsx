import { find } from 'lodash-es'
import { defineComponent, PropType, ref, Ref }  from 'vue'
import { useRoute } from 'vue-router'
import { Item, Fields } from '@/assets/js/class'
import FormGroup from './FormGroup.vue'
import FormField from './FormField.vue'
import FormNotebook from './FormNotebook'
import FlexDrop from '@/components/flex/FlexDrop.vue'
import useExpose from '@/assets/js/hooks/use-expose'

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
    const FieldCompRefs: Ref<any>[]= []

    const canBeSaved = () => {
      let allSet = true
      for(let compRef of FieldCompRefs) {
        if(compRef && compRef.value) {
          if(!compRef.value.isSet()) {
            allSet = false
            break
          }
        }
      }
      return allSet
    }
    useExpose({ canBeSaved })

    const renderItem = (item: Item) => {
      const items = item.items
      const field = find(props.fields as any, { key: item.fieldKey })
      const readonly = route.query.readonly as string === '1' ? true : false

      switch(item.widget) {
        case 'statusbar': 
        case 'div':
          return null
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
        case 'flex_dropdown':
          return (
            <FlexDrop item={item} field={field} readonly={readonly} />
          )
        default:
          const compRef = ref(null)
          FieldCompRefs.push(compRef)
          return (
            <FormField item={item} field={field} readonly={readonly} ref={compRef}/>
          )
      }
    }

    const renderItems = (items?: Item[]) => {
      if(items?.length) {
        const template = items.map(item => renderItem(item))
        return template
      }
    }

    return () => renderItems(props.items)
  }
})


export default FormCanvas