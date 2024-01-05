import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


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
        target:'http://localhost:8001',
        changeOrigin:true,
        rewrite:path=>path.replace(/^\/api/,'')
      }
    }
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@import "@/style.scss";`
  //     }
  //   }
  // },
})
