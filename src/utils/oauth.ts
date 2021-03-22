/**
 * 微信授权相关
 */

import urlKit from '@/utils/url'
import url from 'url'
import qs from 'qs'
import { getWxOpenId } from '@/api/user'
import { LocalStorageKeys } from '@/logics/enums/cache'
import { wrapperEnv } from '@/utils/tools'

const { WX_APP_ID, WX_OPEN_ID, NODE_ENV } = wrapperEnv(process.env)
const isDev = NODE_ENV === 'development'

// 授权类型 
const enum Scope {
  BASE = 'snsapi_base',
  DETAIL = 'snsapi_userinfo' 
}

/**
 * 获取重定向的地址
 * @param host 
 * @param sourceUrl 
 */
const _buildRedirectUrl = (host: string, sourceUrl: string) => {
  sourceUrl = sourceUrl.replace(`http://${host}`, '').replace(`https://${host}`, '')
  return urlKit.getFullUrl(host, urlKit.getCurrentUrlPath(sourceUrl, ['code', 'state']))
}

/**
 * 构造微信授权url
 * @param redirectUri 
 * @param scope 
 * @param state 
 */
const _getWxOauthUrl = (redirectUri: string, scope: string, state: string) => {
  const url = 'https://open.weixin.qq.com/connect/oauth2/authorize'
  const info = {
    appid: WX_APP_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope || 'snsapi_base',
    state: state || ''
  }

  return url + '?' + qs.stringify(info) + '#wechat_redirect'
}

/**
 * 重定向到微信授权页
 * @param scopeType 
 */
const _redirectToWx = (scopeType = Scope.BASE) => {
  const { host, href: currentUrl } = location
  const redirectUrl = _buildRedirectUrl(host, currentUrl)
  const authUrl = _getWxOauthUrl(redirectUrl, scopeType, scopeType)
  window.location.href = authUrl
}

/**
 * 处理从微信重定向过来的地址
 * @param currentUrl 
 */
const _redirectFromWx = async (currentUrl: string) => {
  // 从微信重定向回来带有code和state
  const urlObj = url.parse(currentUrl, true)
  const { code, state } = urlObj.query

  if(!(code && state)) {
    return false
  }

  // 通过code 获取 openid 等信息
  const res = await getWxOpenId(code)
  if(res.ret === 0 && res.data) {
    localStorage.setItem(LocalStorageKeys.wxOpenId, res.data.openId)
  
    // TODO 在url中增加_t参数，防止请求不会发出
    window.location.href = urlKit.getCurrentUrlPath(currentUrl, ['code', 'state'])
  }

  return true
}

/**
 * 静默授权
 */
export const baseOauth = async () => {
  const { href: currentUrl } = location

  const ok = await _redirectFromWx(currentUrl)
  if(ok) return

  // 开发环境写死openid
  if(isDev && WX_OPEN_ID) {
    localStorage.setItem(LocalStorageKeys.wxOpenId, WX_OPEN_ID)
    return WX_OPEN_ID
  }

  _redirectToWx(Scope.BASE)
}