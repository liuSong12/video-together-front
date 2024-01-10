import { defineConfig  } from 'vite'
import vue from '@vitejs/plugin-vue'
// const url = import.meta.env.baseUrl
import config from './src/config'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    // 禁用ES模块语法解析
    syntaxDynamicImport: false
  },
  server:{
    port:5174,
    proxy:{ 
      '/api':{
        target:  config.remoteOriginHttp,
        changeOrigin:true,
        rewrite:path=>path.replace(/^\/api/,'')
      }
    }
  }
})
