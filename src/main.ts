import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import pinia from './store'
import router from './router'
import './router/permission'

createApp(App).use(pinia).use(router).mount('#app')
