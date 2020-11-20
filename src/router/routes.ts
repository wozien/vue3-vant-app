import { defineAsyncComponent } from 'vue'
import { RouteRecordRaw } from 'vue-router'

const Login = defineAsyncComponent(() => import('@views/layout/Login.vue'))
const Layout = defineAsyncComponent(() => import('@views/layout/Layout.vue'))
const Dashboard = defineAsyncComponent(() => import('@views/dashboard/Dashboard.vue'))
const Market = defineAsyncComponent(() => import('@views/market/Market.vue'))
const User = defineAsyncComponent(() => import('@views/user/User.vue'))
const CompanyList = defineAsyncComponent(() => import('@views/user/CompanyList.vue'))
const ListView = defineAsyncComponent(() => import('@views/list/List.vue'))

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
        meta: { title: '首页' }
      },
      {
        path: '/market',
        component: Market,
        meta: { title: '应用' }
      },
      {
        path: '/user',
        component: User,
        meta: { title: '我的' }
      }
    ]
  },
  {
    path: '/companyList',
    component: CompanyList,
    meta: { title: '我的企业' }
  },
  {
    path: '/list',
    name: 'list-view',
    component: ListView
  },
  {
    path: '/workflow',
    component: Layout
  }
]

export default routes