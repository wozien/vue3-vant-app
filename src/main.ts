import { createApp } from 'vue'
import App from './App.vue'
import '@assets/style/reset.less'
import VantPlugin from './plugins/vant'
import Page from './views/layout/Page.vue'

const app = createApp(App)

app.use(VantPlugin)

app.component('Page', Page)

app.mount('#app')
