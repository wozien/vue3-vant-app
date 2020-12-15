import { defineAsyncComponent } from 'vue'
import { RouteRecordRaw } from 'vue-router'

const Login = defineAsyncComponent(() => import('@views/layout/Login.vue'))
const Layout = defineAsyncComponent(() => import('@views/layout/Layout.vue'))
const Dashboard = defineAsyncComponent(() => import('@views/dashboard/Dashboard.vue'))
const Market = defineAsyncComponent(() => import('@views/market/Market.vue'))
const User = defineAsyncComponent(() => import('@views/user/User.vue'))
const CompanyList = defineAsyncComponent(() => import('@views/user/CompanyList.vue'))
const View = defineAsyncComponent(() => import('@views/layout/View.vue'))
const Flow = defineAsyncComponent(() => import('@views/flow/Flow.vue'))

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '用户登录' }
  },
  {
    path: '/layout',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: Dashboard,
        meta: { title: '首页', tab: true }
      },
      {
        path: '/market',
        component: Market,
        meta: { title: '应用', tab: true }
      },
      {
        path: '/user',
        component: User,
        meta: { title: '我的', tab: true }
      },
      {
        path: '/view',
        name: 'view',
        component: View
      },
      {
        path: '/workflow',
        name: 'flow',
        component: Flow
      }
    ]
  },
  {
    path: '/companyList',
    component: CompanyList,
    meta: { title: '我的企业' }
  }
]

export default routes