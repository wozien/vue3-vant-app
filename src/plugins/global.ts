import { App } from 'vue'
import Page from '@views/layout/Page.vue'
import Icon from '@components/icon/Icon.vue'

export default function(app: App) {
  app.component('Page', Page)
  app.component('Icon', Icon)
}