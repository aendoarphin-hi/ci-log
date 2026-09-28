import { createRouter, createWebHistory } from 'vue-router'
import RequestLog from '../views/RequestLog.vue'

const routes = [
  {
    path: '/',
    name: 'CI Log',
    component: RequestLog
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
