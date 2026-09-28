import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/styles/main.scss'
import 'animate.css'

createApp(App)
  .use(router)
  .mount('#app')
