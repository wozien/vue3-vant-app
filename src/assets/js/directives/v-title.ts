import { App } from 'vue' 

export default function install (app: App) {
  const setDocumentTitle = (title: string) => {
    if(!title || window.document.title === title) return
    document.title = title
    
    // ios 不能 document.title 设置问题
    const mobile = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(mobile)) {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
      const iframeCallback = function () {
        setTimeout(() => {
          iframe.removeEventListener('load', iframeCallback)
          document.body.removeChild(iframe)
        }, 0)
      }
      iframe.addEventListener('load', iframeCallback)
      document.body.appendChild(iframe)
    }
  }

  app.directive('title', function(el, binding) {
    setDocumentTitle(binding.value)
  })
}