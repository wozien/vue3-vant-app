import type { UserConfig, ConfigEnv } from 'vite'
import { loadEnv } from 'vite'
import { resolve } from 'path'
import { wrapperEnv, versionDir } from './build/utils'
import { createVitePlugins } from './build/plugin'

function pathResolve(dir: string) {
  return resolve(__dirname, '.', dir)
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  // The boolean type read by loadEnv is a string. This function can be converted to boolean type
  const viteEnv = wrapperEnv(env)
  const isBuild = command === 'build'

  return {
    root,
    resolve: {
      alias: [
        {
          find: /^@\//,
          replacement: pathResolve('src') + '/'
        },
        {
          find: /^#\//,
          replacement: pathResolve('types') + '/'
        },
        // 由于vite暂时不支持less的~导入, 需要替换成空字符串
        {
          find: /^~/,
          replacement: ''
        }
      ]
    },

    build: {
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: true
        }
      },
      // Turning off brotliSize display can slightly reduce packaging time
      brotliSize: false,
      chunkSizeWarningLimit: 1200,
      assetsDir: `${versionDir(viteEnv)}/assets`
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            // 导入变量和mixin样式，避免在每个组件@import
            hack: `true; @import (reference) "${pathResolve('src/assets/style/config.less')}";`
            // 'blue': '#a0dfa0',
          },
          javascriptEnabled: true
        }
      }
    },

    plugins: createVitePlugins(viteEnv, isBuild),

    server: {
      port: 8080,
      open: true,
      cors: true,
      host: '0.0.0.0'
    }
  }
}
