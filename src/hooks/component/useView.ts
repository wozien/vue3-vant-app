import { PropType } from 'vue'
import { FieldsInfo, Fields, View, Model } from '@/logics/types'
import { useRouter, useRoute, NavigationFailure, LocationQuery } from 'vue-router'
import { ViewType } from '@/logics/types'

export const viewCommonProps = {
  fieldsInfo: Object as PropType<FieldsInfo>,
  fields: Object as PropType<Fields>,
  curView: Object as PropType<View>,
  curModel: Object as PropType<Model>
}

export interface ViewQuery {
  model?: string
  viewType?: ViewType
  id?: number | string
  actionId?: number
  subModel?: string
  subId?: number
  readonly?: 0 | 1 | '0' | '1'
  [key: string]: any
}

// overlaod
interface NormalizeQuery<T = ViewQuery> {
  (model: string, viewType: ViewType, actionId?: number, id?: number): T
  (query: ViewQuery, routeQuery?: LocationQuery): T
}

type PromiseRouterNavagation = Promise<void | undefined | NavigationFailure>

type NavigationFn = NormalizeQuery<PromiseRouterNavagation>

interface NavigatorOptions {
  mode?: 'push' | 'replace'
  route?: ReturnType<typeof useRoute>
  router?: ReturnType<typeof useRouter>
}

interface Navigator extends NormalizeQuery<PromiseRouterNavagation> {
  to: NavigationFn
  replace: NavigationFn
  toggleReadonly: (readonly?: boolean) => void
  back: () => void
}

const normalizeQuery: NormalizeQuery = (a: any, b?: any, c?: any, d?: any) => {
  let query: ViewQuery
  if (typeof a === 'string') {
    query = {
      model: a,
      viewType: b
    }
    c && (query.actionId = c)
    d && (query.id = d)
  } else {
    b = b || {}
    query = { ...b, ...a }
  }

  return query
}

export function useViewNavigator({
  mode = 'replace',
  route = useRoute(),
  router = useRouter()
}: NavigatorOptions = {}): Navigator {
  const createNavigationFn = (mode: 'replace' | 'push') => {
    const navigationFn: NavigationFn = (a: any, b?: any, c?: any, d?: any) => {
      const query = normalizeQuery(a, b || route.query, c, d)
      return router[mode]({
        name: 'view',
        query
      })
    }

    return navigationFn
  }

  const navigator = createNavigationFn(mode) as Navigator
  navigator.to = createNavigationFn('push')
  navigator.replace = createNavigationFn('replace')
  navigator.back = () => router.back()
  navigator.toggleReadonly = (readonly = true) => {
    navigator.replace({ readonly: readonly ? 1 : 0 })
  }

  return navigator
}
