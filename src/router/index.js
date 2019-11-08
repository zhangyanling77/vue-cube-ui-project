import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home/index.vue';
import loadable from '@/utils/loadable'
import hooks from './hook'; //获取路由全部的钩子

Vue.use(Router);

let router =  new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        idx: 0,
        keepAlive: true // 需要缓存
      }
    },
    {
      path: '/course',
      name: 'course', 
      component: loadable(() => import('@/views/Course/index.vue')),
      meta: {
        idx: 1,
        keepAlive: true,
        needLogin: true // 需要登陆才能访问
      }
    },
    {
      path: '/profile',
      name: 'profile', 
      component: loadable(() => import('@/views/Profile/index.vue')),
      meta: {
        idx: 2,
        keepAlive: true // 需要缓存
      }
    }, 
    {
      path: '/login',
      name: 'login',
      component: loadable(() => import('@/views/Login/index.vue'))
    }, 
    {
      path: '*',
      component: {
        render(h) {
          return <h1> Not Found </h1>
        }
      }
    }
  ],
});

Object.values(hooks).forEach(hook => {
  // 路由切换之前
  router.deforeEach(hook.bind(router))
})

export default router
