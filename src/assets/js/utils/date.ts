/**
 * 日期相关
 */

 export const formatDate = (fmt: string, date: Date = new Date()): string => {
    const o = {   
        'M+' : date.getMonth()+1,                 
        'd+' : date.getDate(),                   
        'h+' : date.getHours(),                   
        'm+' : date.getMinutes(),               
        's+' : date.getSeconds(),                
        'q+' : Math.floor((date.getMonth()+3)/3), 
        'S'  : date.getMilliseconds()             
    };   
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+'').substr(4 - RegExp.$1.length)); 
    }
        
    for(var k in o)  {
        if(new RegExp('('+ k +')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? 
              (o as any)[k] : ('00'+ (o as any)[k]).substr((''+ (o as any)[k]).length));  
        }
    }
    return fmt;   
 }

/**
* 日期字符串转为Date对象 ios微信兼容 需要把 - 转为 /
* @param str 
* @param zone 
*/
export const str2Date = (str: string, zone = 'UTC'): Date => {
  str = str.replace(/-/g, '/')
  return new Date(`${str} ${zone}`)
}