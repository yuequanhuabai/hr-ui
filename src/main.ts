import { createApp } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import App from './App.vue'
import pinia from './store'
import router from './router'
import './router/permission'
import { setupDirectives } from './directive'

const app = createApp(App)

app.config.errorHandler = (err, _instance, info) => {
  console.error('[App Error]', info, err)
  const msg = err instanceof Error ? err.message : String(err)
  if (msg) ElMessage.error(msg)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason)
})

app.use(pinia).use(router)
setupDirectives(app)
app.mount('#app')
