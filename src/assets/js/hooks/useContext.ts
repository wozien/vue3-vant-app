import App from '@/assets/js/class/App'

const appCaches: {[key: number]: App} = {}

export default function(appId: number, actionId?: number) {
  let app: App | null = null

  // 优先取缓存
  if(appCaches[appId]) {
    app = appCaches[appId]
  } else if(actionId) {
    app = new App(appId, actionId)
    appCaches[appId] = app
  } 

  return {
    curApp: app
  }
} 