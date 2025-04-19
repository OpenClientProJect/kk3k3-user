import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import VideoPlayer from '../views/VideoPlayer.vue'
import Profile from '../views/Profile.vue'
import SearchResults from '../views/SearchResults.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/video/:id',
      name: 'video',
      component: VideoPlayer,
      props: true
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'search',
      component: SearchResults
    }
  ]
})

// 全局导航守卫，处理需要登录的路由
router.beforeEach((to, from, next) => {
  // 如果路由需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录（通过localStorage）
    const isLoggedIn = !!localStorage.getItem('user')
    if (!isLoggedIn) {
      // 未登录则跳转到首页
      next({ name: 'home' })
    } else {
      next() // 已登录则正常跳转
    }
  } else {
    next() // 不需要登录的路由正常跳转
  }
})

export default router