import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store, { key } from './store'
import plugins from './plugins'
import '@/assets/style/index.less'

// 在 dev 环境导入全部的样式， 减少按需加载的组件请求
if (import.meta.env.DEV) {
  import('vant/lib/index.less')
  import('vxe-table/lib/style.css')
}

// import vConsole from 'vconsole'
// new vConsole()

const app = createApp(App)
app.use(router)
app.use(store, key)
app.use(plugins)
app.mount('#app')
