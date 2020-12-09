<template>
  <Modal v-model:show="showModal" @confirm="onConfirm">
    <UserSelect v-model:selected="selected"/>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, toRefs } from 'vue'
import Modal from '@/components/modal/Modal.vue'
import UserSelect from './UserSelect.vue'

export default defineComponent({
  components: {
    Modal,
    UserSelect
  },

  props: {
    show: Boolean
  },

  emits: ['update:show', 'select'],

  setup(props, { emit }) {
    const state = reactive({
      selected: { 
        members: []
      }
    })
    const showModal = computed({
      get() {
        return props.show
      },
      set(val) {
        emit('update:show', val)
      }
    })

    const onConfirm = (cb: Function) => {
      emit('select', state.selected)
      cb()
    }
    
    return {
      showModal,
      ...toRefs(state),
      onConfirm
    }
  }
})
</script>

<style lang="less" scoped>
</style>