export function wrapperEnv(envConf: Record<string, any>) {
  const ret: any = {}

  for (let envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n')
    realName = realName === 'true' ? true : realName === 'false' ? false : realName

    // TODO handler number or array type
    ret[envName] = realName
  }

  return ret
}

export function versionDir(viteEnv: Record<string, any>) {
  return viteEnv['VITE_VERSION'].split('.').join('_')
}
