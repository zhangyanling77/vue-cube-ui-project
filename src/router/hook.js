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
  permission: async (to, from, next) => {
    // 如果用户没有登录 访问了课程页面 应该跳转登录页

    // 1、要知道用户是否登录 2、要知道哪个页面需要登录才能看
    let needLogin = to.matched.some(item => item.meta.needLogin)
    // 这里可以给一个白名单

    if(!store.state.hasPermission){ // 看是否有权限
      let flag = await store.dispatch(types.VALIDATE) // 验证是否登录过
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
    // 
    if(store.state.hashPermission && store.state.user.menuList){
       if(!store.state.menuPermission){
         let list = store.state.user.menuList.map(item => item .auth)
         let newRoutes = auth.filter(item => list.includes(item.name))
         // newRoutes就是我们要新增的路由
         store.commit(types.SET_MENU_LIST)
         this.adddRoutes(newRoutes)
         next({...to, replace: true})
       } else{
         next()
       }
    } else{
      next()
    }
  }
}
