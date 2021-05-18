import { App } from 'vue'
import Icon from '@/components/icon/Icon.vue'
import Modal from '@/components/modal/Modal.vue'
import vTitle from '@/logics/directives/v-title'

export default function (app: App) {
  app.component('Icon', Icon)
  app.component('Modal', Modal)

  app.use(vTitle)
}
