import { App } from 'vue'
import VantPlugin from './vant'
import GlobalPlugin from './global'
import 'xe-utils'
import {
  Table,
  Column,
  Header
} from 'vxe-table'

export default function (app: App) {
  app.use(VantPlugin)
  app.use(GlobalPlugin)
  app.use(Header).use(Column).use(Table)
}