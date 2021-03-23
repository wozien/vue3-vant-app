import { App } from 'vue'
import Icon from '@components/icon/Icon.vue'
import Modal from '@components/modal/Modal.vue'
import Loading from '@components/loading/Loading.vue'
import vTitle from '@/logics/directives/v-title'

export default function(app: App) {
  app.component('Icon', Icon)
  app.component('Modal', Modal)
  app.component('Loading', Loading)

  app.use(vTitle)
}