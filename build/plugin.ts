import { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import styleImport from 'vite-plugin-style-import'

export function createVitePlugins(viteEnv: Record<string, any>, isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    // have to
    vue(),
    vueJsx(),
  ]

  // style import on demand
  if (isBuild) {
    vitePlugins.push(
      styleImport({
        libs: [
          {
            libraryName: 'vant',
            esModule: true,
            resolveStyle: (name) => {
              // https://github.com/anncwb/vite-plugin-style-import/issues/10
              return `vant/es/${name}/style/less`
            },
          },
          {
            libraryName: 'vxe-table',
            esModule: true,
            resolveStyle: (name) => {
              return `vxe-table/lib/${name}/style/index`
            },
          },
        ],
      })
    )
  }

  // others plugin

  return vitePlugins
}
