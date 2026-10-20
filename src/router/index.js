import { createRouter, createWebHistory } from 'vue-router'
import RequestView from '../views/RequestView.vue'
import ProjectView from '../views/ProjectView.vue'
import ApprovalsView from '../views/ApprovalsView.vue'

const routes = [
  {
    path: '/',
    name: 'Requests',
    component: RequestView
  },
  {
    path: '/projects',
    name: 'Projects',
    component: ProjectView
  },
  {
    path: '/approvals',
    name: 'Approvals',
    component: ApprovalsView
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

router.beforeEach((to, from, next) => {
  document.title += ' - ' + to.name
  next()
})

export default router
