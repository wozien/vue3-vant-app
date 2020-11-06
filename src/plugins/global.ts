import { App } from 'vue'
import Page from '@views/layout/Page.vue'
import Icon from '@components/icon/Icon.vue'
import vTitle from '@/assets/js/directives/v-title'

export default function(app: App) {
  app.component('Page', Page)
  app.component('Icon', Icon)

  app.use(vTitle)
}