import { RouteRecordRaw } from 'vue-router'

const Login = () => import('@/views/system/Login.vue')
const Forget = () => import('@/views/system/Forget.vue')
const Register = () => import('@/views/system/Register.vue')
const CompanyList = () => import('@/views/user/CompanyList.vue')
const Layout = () => import('@/views/layout/Layout.vue')
const Dashboard = () => import('@/views/dashboard/Dashboard.vue')
const Market = () => import('@/views/market/Market.vue')
const User = () => import('@/views/user/User.vue')
const View = () => import('@/views/layout/View.vue')
const Flow = () => import('@/views/flow/Flow.vue')
const FlowProcess = () => import('@/views/flow/FlowProcess.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
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
      },
      {
        path: '/view',
        name: 'view',
        component: View,
        meta: { index: 2 }
      },
      {
        path: '/workflow',
        name: 'flow',
        component: Flow,
        meta: { index: 1 }
      },
      {
        path: '/workflowProcess',
        name: 'flow-process',
        component: FlowProcess,
        meta: { index: 3 }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '用户登录', skipAuth: true }
  },
  {
    path: '/forget',
    name: 'forget',
    component: Forget,
    meta: { title: '忘记密码', skipAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: '注册账号', skipAuth: true }
  },
  {
    path: '/companyList',
    component: CompanyList,
    meta: { title: '我的企业' }
  }
]

export default routes
