<template>
<teleport to="body">

  <div class="user-selector" v-show="show">
    <van-tabs v-model:active="active">
      <van-tab title="成员" name="member">11</van-tab>
      <van-tab title="角色" name="role">22</van-tab>
    </van-tabs>
  </div>
</teleport>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
// import Modal from '@/components/modal/Modal.vue'

export default defineComponent({
  // components: {
  //   Modal
  // },

  props: {
    show: Boolean
  },

  emits: ['update:show'],

  setup() {
    const state = reactive({
      active: 'member'
    })

    // const showModal = computed({
    //   get() {
    //     return props.show
    //   },
    //   set(val) {
    //     emit('update:show', val)
    //   }
    // })
    
    return {
      // showModal,
      ...toRefs(state)
    }
  }
})
</script>

<style lang="less" scoped>
.user-selector{
   width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f7f8fa;
  /deep/ .van-tabs .van-tabs__line {
    transform: translateX(94px) translateX(-50%);
  }
}
</style>