import { createApp, ComponentPublicInstance, getCurrentInstance, reactive, nextTick } from 'vue'
import Modal from './Modal.vue'
import Vant from '@/plugins/vant'

let instance: ComponentPublicInstance

interface ModalOptions {
  render: Function
  confirm: (cb: Function) => void
  hideFooter?: boolean
}

const createInstance = () => {
  const app = createApp({

    setup() {
      const state = reactive({
        show: false
      })
      const toggle = (show: boolean) => {
        state.show = show
      }
      const open = (options: ModalOptions) => {
        Object.assign(state, options)
        nextTick(() => {
          toggle(true)
        })
      }

      const self = getCurrentInstance()
      if(self) {
        (self as any).render = () => {
          return (
            <Modal {
              ...{
                ...state,
                'onUpdate:show': toggle
              }
            }/>
          )
        }
      }

      return {
        open,
        toggle
      }
    }
  })

  const root = document.createElement('div')
  document.body.appendChild(root)

  app.use(Vant)
  const instance = app.mount(root)

  window.onpopstate = () => {
    (instance as any).toggle(false)
  }

  return instance
}

export const createModal = (options: ModalOptions) => {
  if(!instance) {
    instance = createInstance()
  }
  
  (instance as any).open(options)
}