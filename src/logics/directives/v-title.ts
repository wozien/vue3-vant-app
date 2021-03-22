import { App } from 'vue' 
import { setDocumentTitle } from '@/hooks/web/useTitle'

export default function install (app: App) {
  app.directive('title', function(el, binding) {
    setDocumentTitle(binding.value)
  })
}