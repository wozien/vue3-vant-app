/**
 * 全局类型声明 
 * 注意： 不能用 export 关键字， 否则会当前 npm 包的声明
 */

// { string: any }
declare type Recordable = Record<string, any>

// http responese
interface HttpRes {
  ret: number;
  msg: string;
  time: number;
  data?: any;
  error?: Object;
}