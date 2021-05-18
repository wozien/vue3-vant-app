export const enum LocalStorageKeys {
  token = 'INSUITE_TOKEN', // 用户登录令牌token
  wxOpenId = 'WX_OPEN_ID' // 微信用户的openid
}

export const enum sessionStorageKeys {
  loadParams = 'APP_LODA_PARAMS', // 应用加载的参数
  flowParams = 'FLOW_PARAMS', // 工作流加载的参数
  x2manyCommand = 'X2MANY_COMMAND', // 记录表体操作的命令
  loginAccount = 'LOGIN_ACCOUNT' // 登录的账号
}
