import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import router from './router'
import App from './App.vue'
import './style.css'

// Import Element Plus icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Import ECharts
import * as echarts from 'echarts'

// 添加版本号或时间戳到全局，可用于调试
const APP_VERSION = import.meta.env.VITE_APP_VERSION || new Date().getTime().toString()
console.log('App Version:', APP_VERSION)

// 简化缓存破坏逻辑，避免可能的问题
if (import.meta.env.PROD) {
  console.log('Running in production mode with version:', APP_VERSION)
}

const app = createApp(App)

// Register all Element Plus icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Add ECharts to global window object
window.echarts = echarts
const store = createPinia();
//数据持久化
store.use(piniaPersist);
app.use(store)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn // 设置为中文简体
})

app.mount('#app')