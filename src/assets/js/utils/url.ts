/**
 * url 相关工具方法
 */

interface QueryParms  {
  [key: string]: any;
}

/**
 * 设置一个url的query参数
 * @param url 
 * @param query 
 */
export const setUrlQuery = (url: string, query: QueryParms) => {
  const urlObj = new URL(url)

  for(let key in query) {
    urlObj.searchParams.set(key, query[key])
  }

  return urlObj.toString()
}