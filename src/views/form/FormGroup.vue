<template>
  <!-- group -->
  <div class="form-item-grop" v-if="type === 'group'">
    <h2 class="group-header" v-if="renderItem.string">
      <span class="string">{{ renderItem.string }}</span>
      <van-icon name="arrow-down" v-if="canfold"></van-icon>
    </h2>
    <div class="group-container">
      <slot></slot>
    </div>
  </div>

  <!-- page -->
  <div class="form-item-page" v-else-if="type ==='page'">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Item } from '@/assets/js/class'

export default defineComponent({
  props: {
    renderItem: Object as PropType<Item>,
    type: String
  },

  setup(props) {
    const attrs = computed(() => props.renderItem && props.renderItem.attrs || {})
    const canfold = computed(() => {
      return attrs.value.can_fold && attrs.value.can_fold.checked
    })
    
    return {
      attrs,
      canfold
    }
  }
})
</script>

<style lang="less" scoped>
.form-item-grop {
  .group-header {
    display: flex;
    align-items: center;
    color: @text-color-light-1;
    padding: 10px 14px;
    .string {
      flex: 1;
      font-size: 13px;
    }
  }
}
</style>