
const isProd = process.env.NODE_ENV === 'production'

export default {

  BASE_URL: isProd ? 'http://182.92.100.160:18080': 'http://182.92.100.160:18080',

  WX_APP_ID: 'wxef1dd7f831c0b5f6',

  WX_APP_SECRET: '79369ee0619481c37fd60f521cf70857'
}