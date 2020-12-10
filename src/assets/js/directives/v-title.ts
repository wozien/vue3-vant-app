import { App } from 'vue' 
import { setDocumentTitle } from '@/assets/js/hooks/useTitle'

export default function install (app: App) {
  app.directive('title', function(el, binding) {
    setDocumentTitle(binding.value)
  })
}