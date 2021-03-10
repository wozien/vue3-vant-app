import { RouteRecordRaw } from 'vue-router'

const Login = () => import('@views/layout/Login.vue')
const Layout = () => import('@views/layout/Layout.vue')
const Dashboard = () => import('@views/dashboard/Dashboard.vue')
const Market = () => import('@views/market/Market.vue')
const User = () => import('@views/user/User.vue')
const CompanyList = () => import('@views/user/CompanyList.vue')
const View = () => import('@views/layout/View.vue')
const Flow = () => import('@views/flow/Flow.vue')
const FlowProcess = () => import('@views/flow/FlowProcess.vue')

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
      }, 
      {
        path: '/workflowProcess',
        name: 'flow-process',
        component: FlowProcess
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