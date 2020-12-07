import { createApp, VNode } from 'vue'
import Modal from './Modal.vue'
import { Button } from 'vant'
import Test from './test'

interface ModalOptions {
  render: () => VNode,
  onOK: (cb: Function) => void
}

export const createModal = (options: ModalOptions) => {
  const app = createApp({
    
    setup() {
      console.log(options)
      return () => {
        return (
          <Modal show={true}>
            <Test onClick={() => console.log('aaa')} />
            {/* <van-button onClick={() => console.log('aaa')}>11</van-button> */}
          </Modal>
        )
      }
    }
  })

  const root = document.createElement('div')
  document.body.appendChild(root)

  app.use(Button)
  app.mount(root)
  // console.log(app._container)
}