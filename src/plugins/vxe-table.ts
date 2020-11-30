import { App } from 'vue'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

export default function(app: App) {
  app.use(VXETable)
}