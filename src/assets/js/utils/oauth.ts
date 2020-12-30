/**
 * 微信授权相关
 */

import urlKit from './url'
import config from '@/api/config'
import qs from 'qs'

// 授权类型 
const enum Scope {
  BASE = 'snsapi_base',
  DETAIL = 'snsapi_userinfo' 
}

const _buildRedirectUrl = (host: string, sourceUrl: string) => {
  sourceUrl = sourceUrl.replace(`http://${host}`, '').replace(`https://${host}`, '')
  return urlKit.getFullUrl(host, urlKit.getCurrentUrlPath(sourceUrl, ['code', 'state']))
}

const _getWxOauthUrl = (redirectUri: string, scope: string, state: string) => {
  const url = 'https://open.weixin.qq.com/connect/oauth2/authorize'
  const info = {
    appid: config['WX_APP_ID'],
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
  console.log(authUrl)
  window.location.href = authUrl
}

/**
 * 静默授权
 */
export const baseOauth = async () => {
  // const { href: currentUrl } = location

  _redirectToWx(Scope.BASE)
}