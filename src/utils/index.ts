import { isFunction, isEmpty, find, iteratee } from 'lodash-es'

/**
 * 树的递归查找
 * @param items
 * @param attrs
 * @param sonField
 */
export const findTree = (items: any[], attrs: Function | Object, sonField = 'children') => {
  if (!isFunction(attrs) && isEmpty(attrs)) {
    return null
  }

  let node = null
  let callback = iteratee(attrs)
  let level = 0

  // 递归查找子级所有节点
  while (items && items.length) {
    let children = [] as any[]
    level++

    node = find(items, (item: any) => {
      children = children.concat(item[sonField] || [])

      return callback(item, level)
    })

    if (node) {
      break
    }

    items = children
  }

  return node
}

/**
 * uuid
 * @param len
 */
export const uuid = (len = 6) => {
  const scopes = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ]

  let res = ''
  for (let i = 0; i < len; i++) {
    const index = Math.floor(Math.random() * 62)
    res += scopes[index]
  }
  return res
}

/**
 * 整形数字千分位
 * @param num
 */
export const insertThousandSeps = (num: number | string) => {
  if (typeof num === 'number') num = num + ''

  const exp = /\d{1,3}(?=(\d{3})+?)/g
  return num.replace(exp, '$&,')
}

/**
 * 对 process.env 处理
 * @param envConf
 * @returns
 */
let envConfig = Object.create(null)
export const wrapperEnv = (envConf?: any): any => {
  if (envConf && isEmpty(envConfig)) {
    for (const envName in envConf) {
      let realValue: any = envConf[envName].replace(/\\n/g, '\n')
      realValue = realValue === 'true' ? true : realValue === 'false' ? false : realValue

      // TODO handler number or array type
      envConfig[envName.replace(/^VITE_/, '')] = realValue
    }
  }
  envConfig['IS_DEV'] = envConfig['NODE_ENV'] === 'developement'
  return envConfig
}

/**
 * 判断是否在微信浏览器
 * @returns
 */
export const isWechatAgent = ({
  iphone,
  android
}: { iphone?: boolean; android?: boolean } = {}) => {
  const ua = navigator.userAgent.toLowerCase()
  let addition = true
  if (iphone) {
    addition = ua.search('iphone') !== -1
  } else if (android) {
    addition = ua.search('android') !== -1
  }
  return ua.search('micromessenger') !== -1 && addition
}

/**
 * 判断是否合法的手机号码, 暂时只校验11位数字
 * @param phoneNumber
 * @returns
 */
export const isLegalPhone = (phoneNumber: string) => {
  return /^\d{11}$/.test(phoneNumber)
}

/**
 * 是否绝对地址
 * @param url
 * @returns
 */
export const isAbsoluteURL = (url: string): boolean => {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

/**
 * 下载文件
 * @param url
 */
export const downloadUrl = (url: string) => {
  const tempLink = document.createElement('a')
  tempLink.style.display = 'none'
  tempLink.href = url
  tempLink.setAttribute('download', 'true')

  // 兼容不支持download属性
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank')
  }

  document.body.appendChild(tempLink)
  tempLink.click()

  // Fixes "webkit blob resource error 1"
  setTimeout(function () {
    document.body.removeChild(tempLink)
  }, 0)
}

/**
 * console.[log|error|warn]
 * @param e
 * @param level
 */
export function log(e: Error | string, level: 'error' | 'warn' | 'info' = 'error') {
  let method = (level === 'info' ? 'log' : level) as keyof Console
  if (import.meta.env.DEV && method in console) {
    console[method].call(null, e)
  }
}
