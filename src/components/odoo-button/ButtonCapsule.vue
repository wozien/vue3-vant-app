<template>
  <van-popover v-model:show="showPopover" v-if="button.expand && button.children.length" placement="top-end">
    <div class="popover-button">
      <div class="popover-button__item van-hairline--bottom van-ellipsis"
        v-for="item in button.children" 
        :key="item.key" 
        @click="onClick(item.key)"
      >{{ item.string }}</div>
    </div>
    <template #reference>
      <Button :button="button"/>
    </template>
  </van-popover>
  <Button v-else :button="button" @click="onClick" />
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { ViewButton } from '@/assets/js/class'
import Button from './Button.vue'

export default defineComponent({
  components: {
    Button
  },

  props: {
    button: Object as PropType<ViewButton>
  },
  emits: ['click'],

  setup(props, { emit }) {
    const showPopover = ref(false)

    const onClick = (key: string) => {
      emit('click', key)
    }

    return {
      showPopover,
      onClick
    }
  }
})
</script>

<style scoped></style>