import { App } from 'vue'
import VantPlugin from './vant'
import GlobalPlugin from './global'

export default function (app: App) {
  app.use(VantPlugin)
  app.use(GlobalPlugin)
}