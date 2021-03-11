import { App } from 'vue'
import Page from '@views/layout/Page.vue'
import Icon from '@components/icon/Icon.vue'
import Modal from '@components/modal/Modal.vue'
import Loading from '@components/loading/Loading.vue'
import Input from '@components/input/Input.vue'
import vTitle from '@/assets/js/directives/v-title'

export default function(app: App) {
  app.component('Page', Page)
  app.component('Icon', Icon)
  app.component('Modal', Modal)
  app.component('Loading', Loading)
  app.component('MyInput', Input)
  app.use(vTitle)
}