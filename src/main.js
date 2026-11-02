import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/styles/main.scss'
import 'animate.css'
import ModalComponent from "./components/ModalComponent.vue"

const app = createApp(App)

app.config.globalProperties = {
  $webroot: process.env.NODE_ENV === 'production'
    ? window.location.origin
    : window.location.protocol + '//' + window.location.hostname,
  $version: '2026.1102.1 ',
  $api: '/ttprod/v3/improvement/api/',
  $axios: axios,
}
console.log('Continuous Improvment v' + app.config.globalProperties.$version)
app
  .use(router)
  .component('ModalComponent', ModalComponent)
  .mount('#app')
