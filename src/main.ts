import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store, { key } from './store'
import plugins from './plugins'
import '@assets/style/reset.less'
import '@assets/style/iconfont.less'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
// import vConsole from 'vconsole'

// new vConsole()

const app = createApp(App)
app.use(router)
app.use(store, key)
app.use(plugins)
app.use(VXETable)
app.mount('#app')
