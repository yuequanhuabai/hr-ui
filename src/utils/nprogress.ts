import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
  easing: 'ease',
  speed: 300
})

export default NProgress
