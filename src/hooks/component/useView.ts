import { PropType } from 'vue'
import { FieldsInfo, Fields, View } from '@/logics/types'
import { useRouter } from 'vue-router'
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
}

interface NormalizeQuery<T = ViewQuery> {
  (model: string, viewType: ViewType, actionId?: number, id?: number): T
  (query: ViewQuery, extend?: Recordable): T
}

const normalize: NormalizeQuery = (a: any, b: any, c?: any, d?: any) => {
  let query: ViewQuery
  if (typeof a === 'string') {
    query = {
      model: a,
      viewType: b
    }
    c && (query.actionId = c)
    d && (query.id = d)
  } else {
    query = Object.assign(a, b || {})
  }

  return query
}

export function useViewNavigater() {
  const router = useRouter()

  const to: NormalizeQuery<void> = (a: any, b: any, c?: any, d?: any) => {
    const query = normalize(a, b, c, d)
    router.push({
      name: 'view',
      query: { ...query }
    })
  }

  const replace: NormalizeQuery<void> = (a: any, b: any, c?: any, d?: any) => {
    const query = normalize(a, b, c, d)
    router.replace({
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
