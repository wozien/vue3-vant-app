import { PropType } from 'vue'
import { FieldsInfo, Fields, View } from '@/logics/types'
import { useRouter, NavigationFailure } from 'vue-router'
import { ViewType } from '@/logics/types'

export const viewCommonProps = {
  fieldsInfo: Object as PropType<FieldsInfo>,
  fields: Object as PropType<Fields>,
  curView: Object as PropType<View>
}

export interface ViewQuery {
  model: string
  viewType: ViewType
  id?: number
  actionId?: number
  subModel?: string
  subId?: number
  readonly?: 0 | 1 | '0' | '1'
}

// overlaod
interface NormalizeQuery<T = ViewQuery> {
  (model: string, viewType: ViewType, actionId?: number, id?: number): T
  (query: ViewQuery, extend?: Recordable): T
}

const normalizeQuery: NormalizeQuery = (a: any, b: any, c?: any, d?: any) => {
  let query: ViewQuery
  if (typeof a === 'string') {
    query = {
      model: a,
      viewType: b
    }
    c && (query.actionId = c)
    d && (query.id = d)
  } else {
    query = Object.assign({}, a, b || {})
  }

  return query
}

type PromiseRouterNavagation = Promise<void | undefined | NavigationFailure>

export function useViewNavigater() {
  const router = useRouter()

  const to: NormalizeQuery<PromiseRouterNavagation> = (a: any, b: any, c?: any, d?: any) => {
    const query = normalizeQuery(a, b, c, d)
    return router.push({
      name: 'view',
      query: { ...query }
    })
  }

  const replace: NormalizeQuery<PromiseRouterNavagation> = (a: any, b: any, c?: any, d?: any) => {
    const query = normalizeQuery(a, b, c, d)
    return router.replace({
      name: 'view',
      query: { ...query }
    })
  }

  return {
    to,
    replace,
    back: router.back
  }
}
