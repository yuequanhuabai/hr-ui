import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import App from './App.vue'
import pinia from './store'
import router from './router'
import './router/permission'
import { setupDirectives } from './directive'

const app = createApp(App)
app.use(pinia).use(router)
setupDirectives(app)
app.mount('#app')
