/**
 * @see https://vueuse.org/templateRef
 */

import { Ref, onMounted, getCurrentInstance, customRef } from 'vue'

export default function templateRef<T extends HTMLElement | null>(
  key: string,
  initialValue: T | null = null
): Readonly<Ref<T>> {
  const instance = getCurrentInstance()
  let _trigger = () => {}

  const element = customRef((track, trigger) => {
    _trigger = trigger
    return {
      get() {
        track()
        return instance?.proxy?.$refs[key] ?? initialValue
      },
      set() {}
    }
  })

  onMounted(_trigger)
  // onUpdated(_trigger)

  return element as Readonly<Ref<T>>
}
