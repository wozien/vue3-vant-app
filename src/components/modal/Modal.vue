
<script lang="tsx">
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    },
    hideFooter: Boolean,
    confirmText: String,
    render: Function,
    confirm: Function
  },

  emits: ['confirm', 'cancel', 'update:show'],

  setup(props, { emit, slots }) {
    const loading = ref(false)

    const height = computed(() => {
      const res = document.body.clientHeight
      return !props.hideFooter ? res - 64: res
    })

    const onCancel = () => {
      emit('update:show', false)
      emit('cancel')
    }

    const onConfirm = () => {
      loading.value = true
      const cb = (keepModal?: Boolean) => {
        loading.value = false
        if(!keepModal) {
          emit('update:show', false)
        }
      }
      emit('confirm', cb)
      if(props.confirm) {
        props.confirm(cb)
      }
    }

    const renderContent = () => {
      if(slots && slots.default) {
        return slots.default()
      } else if(props.render) {
        return props.render()
      }
    }

    const renderFooter = () => {
      const defaultButtons = () =>(
        <div class="footer">
          <van-button onClick={onCancel} round block>返回</van-button>
          <van-button type="primary" round block onClick={onConfirm} loading={loading.value}>
            { props.confirmText || '确定' }
          </van-button>
        </div>
      )

      if(!props.hideFooter) {
        return slots.footer ? (
          <div>{ slots.footer() }</div>
        ) : defaultButtons()
      }
    }

    return () => {
      return (
        <div class="ins-modal" v-show={props.show}>
          <div class="main" style={{'height': height.value + 'px'}}>
            { renderContent() }
          </div>
          { renderFooter() }
        </div>
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
  .main {
    // height: calc(100vh - 64px);
    overflow: auto;
    position: relative;
  }
  .footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 10px;
    display: flex;
    .van-button {
      height: 38px;
      margin: 0px 4px;
      &:first-child {
        flex: 0 0 100px;
      }
    }
  }
}
</style>