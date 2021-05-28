<script lang="tsx">
import { defineComponent, ref, Transition } from 'vue'

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    },
    hideFooter: Boolean,
    hideCancel: Boolean,
    confirmText: String,
    render: Function,
    confirm: Function,
    cancel: Function
  },

  emits: ['confirm', 'cancel', 'update:show'],

  setup(props, { emit, slots }) {
    const loading = ref(false)

    // const height = computed(() => {
    //   const res = document.body.clientHeight
    //   return !props.hideFooter ? res - 64 : res
    // })

    const onCancel = () => {
      emit('update:show', false)
      emit('cancel')
      if (props.cancel) {
        props.cancel()
      }
    }

    const onConfirm = () => {
      loading.value = true
      const cb = (keepModal?: Boolean) => {
        loading.value = false
        if (!keepModal) {
          emit('update:show', false)
        }
      }
      emit('confirm', cb)
      if (props.confirm) {
        props.confirm(cb)
      }
    }

    const renderContent = () => {
      if (slots && slots.default) {
        return slots.default()
      } else if (props.render) {
        return props.render()
      }
    }

    const renderFooter = () => {
      const defaultButtons = () => (
        <div class="footer">
          {props.hideCancel ? null : (
            <van-button onClick={onCancel} class="cancel-btn" round block>
              返回
            </van-button>
          )}
          <van-button type="primary" round block onClick={onConfirm} loading={loading.value}>
            {props.confirmText || '确定'}
          </van-button>
        </div>
      )

      if (!props.hideFooter) {
        return slots.footer ? <div>{slots.footer()}</div> : defaultButtons()
      }
    }

    return () => {
      return (
        <Transition name="slide">
          <div class="ins-modal" v-show={props.show}>
            <div class="main">{renderContent()}</div>
            {renderFooter()}
          </div>
        </Transition>
      )
    }
  }
})
</script>

<style lang="less">
.ins-modal {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
  .main {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }
  .footer {
    flex: 0 0 64px;
    padding: 10px;
    display: flex;
    .van-button {
      height: 38px;
      margin: 0px 4px;
      &.cancel-btn {
        flex: 0 0 100px;
      }
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
