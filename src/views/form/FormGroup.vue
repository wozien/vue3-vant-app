<template>
  <!-- group -->
  <div class="form-item-group" v-if="type === 'group'">
    <h2 class="group-header" v-if="renderItem.string" @click="toggle">
      <span class="string">{{ renderItem.string }}</span>
      <van-icon
        v-if="canfold"
        name="arrow"
        :class="['fold-icon', !expanded && 'rotate-fold-icon']"
      />
    </h2>
    <div class="group-wrapper" ref="wrapperRef" @transitionend="onTransitionEnd" v-show="show">
      <div class="group-content" ref="contentRef">
        <slot></slot>
      </div>
    </div>
  </div>

  <!-- page -->
  <div class="form-item-page" v-else-if="type === 'page'">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, nextTick } from 'vue'
import { Item } from '@/logics/types'
import { doubleRaf, raf } from '@vant/use'
import templateRef from '@/hooks/core/templateRef'

export default defineComponent({
  props: {
    renderItem: {
      type: Object as PropType<Item>,
      required: true
    },
    type: String
  },

  setup(props) {
    const expanded = ref(true)
    const show = ref(expanded.value)
    const wrapperRef = templateRef('wrapperRef')
    const contentRef = templateRef('contentRef')

    const attrs = computed(() => (props.renderItem && props.renderItem.attrs) || {})
    const canfold = computed(() => {
      return attrs.value.can_fold && attrs.value.can_fold.checked
    })

    const toggle = () => {
      if (!canfold.value) return
      expanded.value = !expanded.value
    }

    const onTransitionEnd = () => {
      if (!expanded.value) {
        show.value = false
      } else if (wrapperRef.value) {
        wrapperRef.value.style.height = ''
      }
    }

    watch(expanded, val => {
      if (val) {
        show.value = true
      }

      // Use raf: flick when opened in safari
      // Use nextTick: closing animation failed when set `user-select: none`
      const tick = val ? nextTick : raf

      tick(() => {
        if (!wrapperRef.value || !contentRef.value) return

        const { offsetHeight } = contentRef.value
        if (offsetHeight) {
          const contentHeight = `${val ? 0 : offsetHeight}px`
          wrapperRef.value.style.height = contentHeight

          // use double raf to ensure animation can start
          doubleRaf(() => {
            wrapperRef.value && (wrapperRef.value.style.height = contentHeight)
          })
        } else {
          onTransitionEnd()
        }
      })
    })

    return {
      canfold,
      expanded,
      show,
      toggle,
      onTransitionEnd
    }
  }
})
</script>

<style lang="less" scoped>
.form-item-group {
  .group-header {
    display: flex;
    align-items: center;
    color: @ins-text-color-light-1;
    padding: 10px 14px;
    .string {
      flex: 1;
      font-size: 13px;
    }

    .fold-icon {
      transition: transform 0.25s ease;
      transform: rotate(-90deg);
      &.rotate-fold-icon {
        transform: rotate(90deg);
      }
    }
  }

  .group-wrapper {
    overflow: hidden;
    transition: height 0.3s ease-in-out;
    will-change: height;
  }
}
</style>
