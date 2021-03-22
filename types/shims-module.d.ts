declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'url' {
  const classes: any
  export default classes
}

declare module 'bpmn-js/lib/Modeler' {
  const classes: any
  export default classes
}