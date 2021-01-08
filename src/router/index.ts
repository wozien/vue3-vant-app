import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { LocalStorageKeys } from '@/assets/js/constant'
import { baseOauth } from '@/assets/js/utils/oauth'
import { getToken } from '@/api/user'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// beforeEach hook
router.beforeEach(async (to) => {
  let token = localStorage.getItem(LocalStorageKeys.token)
  
  if(to.path !== '/login' && !token) {
    let openid = localStorage.getItem(LocalStorageKeys.wxOpenId)
    // 通过微信静默授权获取open_id
    if(!openid) {
      const data = await baseOauth()
      data && (openid = data)
    }
    
    // 通过open_id 获取 token 信息
    if(openid) {
      const res = await getToken(openid)
      if(res.ret === 0 && res.data) {
        token = res.data.token
        token && localStorage.setItem(LocalStorageKeys.token, token)
      }
    }

    if(!token) {
      return { name: 'login' }
    } 
  }
  return true
})

export default router