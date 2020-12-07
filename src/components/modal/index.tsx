import { createApp } from 'vue'
import Modal from './Modal.vue'

// interface ModalOptions {
//   render: () => VNode
// }

export const createModal = () => {
  const app = createApp({
    setup() {
      return () => {
        return (
          <Modal show={true}>111</Modal>
        )
      }
    }
  })

  const root = document.createElement('div')
  document.body.appendChild(root)

  app.mount(root)
  // console.log(app._container)
}