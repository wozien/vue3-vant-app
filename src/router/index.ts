import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import store from '@/store'
import { LocalStorageKeys } from '@/assets/js/constant'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// beforeEach hook
router.beforeEach(async (to) => {
  const token = localStorage.getItem(LocalStorageKeys.token)
  // TODO token不存在时 通过open_id校验状态
  if(to.path !== '/login' && !token) {
    return { name: 'login' }
  } 
  if(token && !store.state.user.nickname) {
    await store.dispatch('setUserInfo')
  }
  return true
})

export default router