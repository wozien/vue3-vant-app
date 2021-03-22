const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const tsImportPluginFactory = require('ts-import-plugin')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  // 静态资源根路径
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  // 生产不打包sourcemap文件
  productionSourceMap: false,
  parallel: false,

  chainWebpack: config => {
    // 别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('#', resolve('types'))
      .set('@components', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@assets', resolve('src/assets'))

    // vant 按需引入
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => {
        options = merge(options, {
          happyPackMode: true,
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [
              tsImportPluginFactory([
                {
                  libraryName: 'vant',
                  libraryDirectory: 'es',
                  // 指定样式路径
                  style: (name) => `${name}/style/less`
                },
                {
                  libraryName: 'vxe-table',
                  style: true
                }
              ])
            ]
          }),
          compilerOptions: {
            module: 'es2015'
          }
        });
        return options
      })
  },

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          WX_ENV: JSON.stringify(process.env.WX_ENV)
        }
      })
    ]
  },

  css: {
    loaderOptions: {
      less: {
        // vant 样式覆盖
        lessOptions: {
          modifyVars: {
            'tabs-default-color': '#1989fa',
            'dialog-confirm-button-text-color': '#1989fa',
            'tree-select-item-active-color': '#1989fa',
            'sidebar-selected-border-color': '#1989fa',
            'popover-action-line-height': 44
          }
        },
      },
    },
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
