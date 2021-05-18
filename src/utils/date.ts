/**
 * 日期相关
 */

export const formatDate = (fmt: string, date: Date = new Date(), isUTC = false): string => {
  const year = isUTC ? date.getUTCFullYear() : date.getFullYear()
  const month = isUTC ? date.getUTCMonth() : date.getMonth()
  const day = isUTC ? date.getUTCDate() : date.getDate()
  const hours = isUTC ? date.getUTCHours() : date.getHours()
  const minutes = isUTC ? date.getUTCMinutes() : date.getMinutes()
  const seconds = isUTC ? date.getUTCSeconds() : date.getSeconds()
  const o = {
    'M+': month + 1,
    'd+': day,
    'h+': hours,
    'm+': minutes,
    's+': seconds,
    'q+': Math.floor((month + 3) / 3),
    S: isUTC ? date.getUTCMilliseconds() : date.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (year + '').substr(4 - RegExp.$1.length))
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? (o as any)[k]
          : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length)
      )
    }
  }
  return fmt
}

/**
 * 日期字符串转为Date对象 ios微信兼容 需要把 - 转为 /
 * @param str
 * @param zone
 */
export const str2Date = (str: string, zone = 'UTC'): Date => {
  str = str.replace(/-/g, '/')
  return zone ? new Date(`${str} ${zone}`) : new Date(str)
}
