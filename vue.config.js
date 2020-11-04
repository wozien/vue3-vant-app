const path = require('path')
const merge = require('webpack-merge')
const tsImportPluginFactory = require('ts-import-plugin')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  // 生产不打包sourcemap文件
  productionSourceMap: false,

  chainWebpack: config => {
    // 别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@components', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@assets', resolve('src/assets'))
      .set('@scripts', resolve('src/assets/js'))

    // vant 按需引入
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => {
        options = merge(options, {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [
              tsImportPluginFactory({
                libraryName: 'vant',
                libraryDirectory: 'es',
                style: true
              })
            ]
          }),
          compilerOptions: {
            module: 'es2015'
          }
        });
        return options
      })
  },

  // 样式自动导入
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        resolve('src/assets/style/var.less'),
        resolve('src/assets/style/mixin.less')
      ]
    }
  },

  devServer: {
    port: 8080,
    disableHostCheck: true,
    hotOnly: true,
    // dev 环境请求代理
    // before: proxy.before
  }
}
