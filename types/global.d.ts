/**
 * 全局类型声明 
 * 注意： 不能用 export 关键字， 否则会当作 npm 包的声明
 */

// Record
declare type Recordable<T = any> = Record<string, T>

declare type Nullable<T> = T | null

// http responese
interface HttpRes {
  ret: number;
  msg: string;
  time: number;
  data?: any;
  error?: Object;
}