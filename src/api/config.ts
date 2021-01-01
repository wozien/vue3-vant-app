
const isProd = process.env.NODE_ENV === 'production'

const wxEnv = 'dev'     // dev 测试公众号  uat 灰度公众号  prod  生产公众号

export default {

  IS_PROD: isProd, 

  BASE_URL: isProd ? 'http://182.92.100.160:18080': 'http://182.92.100.160:18080',

  WX_APP_ID: wxEnv === 'dev' ? 'wxef1dd7f831c0b5f6' : (wxEnv === 'uat' ? 'wx33e995dcf375d68a' : ''),

  WX_APP_SECRET: wxEnv === 'dev' ? '79369ee0619481c37fd60f521cf70857' : (wxEnv === 'uat' ? '8f536b9e5bc89b2030f56a3395d032e4' : ''),

  WX_OPEN_ID: 'oWkYa5j_tQDiPWuWvdcbimgI40Tk'
}