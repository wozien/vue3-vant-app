import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// beforeEach hook
router.beforeEach((to) => {
  const token = localStorage.getItem('INSUITE_TOKEN')
  // TODO token不存在时 通过open_id校验状态
  if(to.path !== '/login' && !token) {
    return { name: 'login' }
  }
  return true
})

export default router