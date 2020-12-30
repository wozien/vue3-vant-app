import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { LocalStorageKeys } from '@/assets/js/constant'

// 路由base设置
const base = process.env.NODE_ENV === 'production' ? '/' : '/'

const router = createRouter({
  history: createWebHashHistory(base),
  routes
})

// beforeEach hook
router.beforeEach(async (to) => {
  const token = localStorage.getItem(LocalStorageKeys.token)
  // TODO token不存在时 通过open_id校验状态
  if(to.path !== '/login' && !token) {
    return { name: 'login' }
  }
  return true
})

export default router