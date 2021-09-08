import http from '@/utils/http'

// 获取图形验证码
export const fetchImageCode = async (): HttpResPromise => {
  const res = await http.get('/system/captcha')
  return res.data
}

// 获取短信验证码
export const fetchMessageCode = async ({
  account,
  imgCode,
  imgCodeId
}: {
  account: string
  imgCode: string
  imgCodeId: string
}): HttpResPromise => {
  const res = await http.post('/system/sms_code', {
    image_code: imgCode,
    image_id: imgCodeId,
    phone_number: account
  })
  return res.data
}

// 身份认证
export const forgetAuthorize = async (
  account: string,
  smsCode: string,
  type?: string
): HttpResPromise => {
  let res,
    data = {
      phone_number: account,
      sms_code: smsCode
    }

  if (type === 'register') {
    res = await http.post('/system/check_sms_code', data)
  } else {
    res = await http.post('/system/authenticate', data)
  }
  return res.data
}

// 修改密码
export const modifyPassward = async (account: any, code: string, token: string): HttpResPromise => {
  const res = await http.post(
    '/system/reset_password',
    {
      login: account.phone,
      password: account.password,
      confirm_password: account.repassword,
      random_code: code
    },
    {
      headers: {
        Authorization: 'Bearer ' + token
      }
    }
  )

  return res.data
}

// 注册账号
export const register = async (account: any, code: string): HttpResPromise => {
  const res = await http.post('/system/register', {
    name: account.name,
    phone_number: account.phone,
    password: account.password,
    confirm_password: account.repassword,
    random_code: code
  })
  return res.data
}

// 判断账号是否注册过
export const getUserCount = async (account: string): HttpResPromise => {
  const res = await http.get('/system/user_count', {
    params: { account }
  })
  return res.data
}

/**
 * 图像查询
 * @param image
 * @returns
 */
export const imageSearch = async (image: File): HttpResPromise => {
  const formData = new FormData()
  formData.append('image', image)
  const res = await http.post('/image/search', formData)
  return res.data
}

// 获取系统精度
export const fetchPrecision = async (): Promise<HttpRes> => {
  const res = await http.get('/system/precision_info')
  return res.data
}
