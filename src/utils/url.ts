/**
 * url 相关工具方法
 */

import urlKit from 'url'
import { omit } from 'lodash-es'
import qs from 'qs'

interface QueryParms {
  [key: string]: any
}

/**
 * 设置一个url的query参数
 * @param url
 * @param query
 */
export const setUrlQuery = (url: string, query: QueryParms) => {
  const urlObj = new URL(url)

  for (let key in query) {
    urlObj.searchParams.set(key, query[key])
  }

  return urlObj.toString()
}

const _buildQueryString = (params: any) => {
  return params
    ? Object.keys(params).reduce((acc, key) => {
        return acc + (acc ? '&' : '') + `${key}=${params[key]}`
      }, '')
    : ''
}

const _getQueryString = (urlOrQueryStringObj: string | Object, keysToBeStripped: string[]) => {
  let query
  if (typeof urlOrQueryStringObj === 'object') {
    query = urlOrQueryStringObj
  } else {
    query = urlKit.parse(urlOrQueryStringObj, true).query
  }

  return qs.stringify(omit(query, keysToBeStripped))
}

// 给 URL 增加 _t 时间参数
export const getTimedUrl = function (origUrl: string) {
  const newUrl = origUrl.replace(/([?&])_t=\d+/, '$1_t=' + Date.now())
  if (newUrl !== origUrl) {
    return newUrl
  }
  return origUrl + (origUrl.includes('?') ? '&' : '?') + '_t=' + Date.now()
}

/**
 * 处理path
 * @param url
 * @param queryKeysToBeStripped
 */
export const getCurrentUrlPath = function (url: string, queryKeysToBeStripped: boolean | string[]) {
  let finalUrl = url
  if (queryKeysToBeStripped === true) {
    finalUrl = url.replace(/\?.+$/, '')
  }
  if (queryKeysToBeStripped && Array.isArray(queryKeysToBeStripped)) {
    const queryString = _getQueryString(url, queryKeysToBeStripped)
    finalUrl = url.replace(/\?.+$/, '') + (queryString ? '?' + queryString : '')
  }
  // if (queryParamsToBeAdded) {
  //   const urlObj = urlKit.parse(finalUrl, true)
  //   finalUrl = urlObj.pathname + '?' +
  //     _buildQueryString({ ...urlObj.query, ...queryParamsToBeAdded })
  // }
  return finalUrl
}

/**
 * 获取完整的地址
 * @param host
 * @param path
 * @param params
 * @param newDomain
 * @param useHttps
 */
export const getFullUrl = function (
  host: string,
  path: string,
  params?: any,
  newDomain?: string,
  useHttps = false
) {
  const protocol = useHttps ? 'https://' : 'http://'
  if (newDomain) {
    const hostParts = host.split(':')
    hostParts[0] = newDomain
    host = hostParts.join(':')
  }
  const query = _buildQueryString(params)
  return protocol + host + path + (query ? '?' : '') + query
}

export default {
  getFullUrl,
  getCurrentUrlPath,
  getTimedUrl
}
