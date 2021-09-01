import { defineComponent, PropType, computed } from 'vue'
import { useStore } from '@/store'
import { Item } from '@/logics/types'
import { evalModifiers } from '@/logics/core/dataPoint'

export default defineComponent({
  props: {
    renderItem: Object as PropType<Item>
  },

  setup(props, { slots }) {
    const store = useStore()
    const items = computed(() => props.renderItem?.items || [])
    const curRecord = computed(() => store.getters.curRecord)
    const slotNodes = computed(() => {
      if (slots && slots.default) {
        const fragments = slots.default()
        if (fragments.length) {
          return fragments[0] && fragments[0].children
        }
      }
      return []
    })

    const getTabItems = () => {
      if (items.value.length && slotNodes.value?.length) {
        return items.value.map((item: Item, index) => {
          let invisible = false
          if (item.modifiers.invisible && curRecord.value) {
            const modifiers = evalModifiers(curRecord.value.id, item.modifiers)
            invisible = !!modifiers && modifiers.invisible
          }

          if (!invisible) {
            return (
              <van-tab title={item.string}>
                {slotNodes.value ? (slotNodes.value as any)[index] : null}
              </van-tab>
            )
          }
        })
      }
    }

    return () => {
      return (
        <div class="form-item-notebook">
          <van-tabs swipe-threshold={2}>{getTabItems()}</van-tabs>
        </div>
      )
    }
  }
})
