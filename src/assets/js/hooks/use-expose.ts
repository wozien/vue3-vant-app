/**
 * 组件实例属性暴露hook
 */

import { getCurrentInstance } from 'vue'

export default function(apis: Record<string, any>) {
  const instance = getCurrentInstance()
  if(instance) {
    Object.assign(instance.proxy, apis)
  }
}