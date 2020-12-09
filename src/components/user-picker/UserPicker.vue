<template>
  <Modal v-model:show="showModal">
    <div class="user-selector" v-show="show">
      <van-tabs v-model:active="active">
        <van-tab title="成员" name="member">
          <div class="selected"></div>
          <div class="list-container"></div>
        </van-tab>
        <van-tab title="角色" name="role">22</van-tab>
      </van-tabs>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs } from 'vue'
import Modal from '@/components/modal/Modal.vue'

export default defineComponent({
  components: {
    Modal
  },

  props: {
    show: Boolean
  },

  emits: ['update:show'],

  setup(props, { emit }) {
    const state = reactive({
      active: 'member'
    })

    const showModal = computed({
      get() {
        return props.show
      },
      set(val) {
        emit('update:show', val)
      }
    })
    
    return {
      showModal,
      ...toRefs(state)
    }
  }
})
</script>

<style lang="less" scoped>
.user-selector{
  height: 100%;
  /deep/ .van-tabs .van-tabs__line {
    transform: translateX(94px) translateX(-50%);
  }
}
</style>