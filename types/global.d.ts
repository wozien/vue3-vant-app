/**
 * 全局类型声明
 * 注意： 不能用 export 关键字， 否则会当作 npm 包的声明
 */

// Record
declare type Recordable<T = any> = Record<string, T>

declare type ReadonlyRecordable<T = any> = {
  readonly [key: string]: T
}

declare type Nullable<T> = T | null

// nerver 表示永远不可能发生的类型
declare type NonNullable<T> = T extends null | undefined ? never : T

declare interface Fn<T = any, R = T> {
  (...args: T[]): R
}

// http responese
declare interface HttpRes {
  ret: number
  msg: string
  time: number
  data?: any
  error?: Object
}

declare type HttpResPromise = Promise<HttpRes>
