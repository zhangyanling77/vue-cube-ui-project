// 根路由相关的hook 钩子 全局钩子
import store from '@/store';
import * as types from '@/store/actions-type'
import auth from './auth'

export default {
  // 标识 当前的hook的作用
  cancelToken: (to, from, next) => {
    // 清除token
    store.commit(types.CLEAR_TOKEN); // 清除所有的请求
    next(); // 继续往下走
  },

  // 给每一个hook 对应一个功能 可以做权限校验相关的
  permission: (to, from, next) => {
    // 如果用户没有登录 访问了课程页面 应该跳转登录页

    // 1、要知道用户是否登录 2、要知道哪个页面需要登录才能看
    let needLogin = to.matched.some(item => item.meta.needLogin)
    // 这里可以给一个白名单

    if(!store.state.hasPermission){
      let flag = await store.dispatch(types.VALIDATE)
      if(needLogin){
        if(!flag){
          next('/login')
        } else {
          next()
        }
      } else {
        if(to.name === 'login'){
          if(!flag){
            next('/profile')
          } else {
            next()
          }
        }
      }
    } else {
      if(to.name === 'login'){
        next('/')
      } else {
        next()
      }
    }

  },
  // 在页面切换的时候 需要拿到 当前状态是否登录
  profileAuth: function(to, from, next){
    // 明天继续
  }
}
