
import { defineComponent, PropType, computed } from 'vue'
import { Item } from '@/assets/js/class'

export default defineComponent({
  props: {
    renderItem: Object as PropType<Item>
  },

  setup(props, { slots }) {
    const items = computed(() => props.renderItem?.items || [])
    const slotNodes = computed(() => {
      if(slots && slots.default) {
        const fragments = slots.default();
        if(fragments.length) {
          return fragments[0] && fragments[0].children
        }
      }
      return []
    })

    const getTabItems = () => {
      if(items.value.length && slotNodes.value?.length) {
        return items.value.map((item: Item, index) => {
          return (<van-tab title={item.string}>
            { slotNodes.value ? (slotNodes.value as any)[index] : null }
          </van-tab>)
        })
      }
    }
    
    return () => {
      return (
        <div class="form-item-notebook">
          <van-tabs swipe-threshold={2}>
            {getTabItems()}
          </van-tabs>
        </div>
      )
    }
  }
})

