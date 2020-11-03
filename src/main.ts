import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import plugins from './plugins'
import '@assets/style/reset.less'
import '@assets/style/iconfont.less'

const app = createApp(App)
app.use(router)
app.use(plugins)
app.mount('#app')
