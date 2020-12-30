import { ref, watchEffect } from 'vue'
import { RouteLocation } from 'vue-router'
import { App, ViewType, Model, View } from '@/assets/js/class'

export default function(app: App, route: RouteLocation) {

  const curModel = ref<Model | null>(null)
  const curView = ref<View | null>(null)

  watchEffect(() => {
    
    if(app.isLoaded) {
      curModel.value = app.getModel(route.query.model as string)
      curView.value = app.getView(route.query.viewType as ViewType)
    }
  })

  return {
    curModel,
    curView
  }
}