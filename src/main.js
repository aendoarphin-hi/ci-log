import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/styles/main.scss'
import 'animate.css'

const app = createApp(App)

app.config.globalProperties = {
  $webroot: process.env.NODE_ENV === 'production'
    ? window.location.origin // prod applist
    : 'http://10.10.8.156', // your dev applist
  $version: '2026.1021.1',
  $api: '/ttprod/v3/improvement/api/',
  $axios: axios
}

app
  .use(router)
  .mount('#app')
