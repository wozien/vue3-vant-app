<template>
  <teleport to="body">
    <div class="ins-modal" v-if="show">
      <div class="main">
        <slot></slot>
      </div>
      <div class="footer">
        <slot name="footer">
          <van-button round block @click="onCancel">返回</van-button>
          <van-button type="primary" round block @click="onConfirm" :loading="loading">保存</van-button>
        </slot>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['cancel', 'confirm', 'update:show'],
  setup(props, { emit }) {
    const loading = ref(false)

    const onCancel = () => {
      emit('update:show', false)
      emit('cancel')
    }

    const onConfirm = () => {
      loading.value = true
      emit('confirm', (keepModal?: Boolean) => {
        loading.value = false
        if(!keepModal) {
          emit('update:show', false)
        }
      })
    }

    return {
      loading,
      onCancel,
      onConfirm
    }
  }
})
</script>

<style lang="less" scoped>
.ins-modal {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f7f8fa;
  .main {
    height: calc(100vh - 64px);
    overflow: auto;
  }
  .footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 10px;
    display: flex;
    /deep/ .van-button {
      margin: 0px 10px;
    }
  }
}
</style>