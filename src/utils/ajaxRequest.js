import axios from 'axios';
import { Toast } from 'cube-ui'
import store from '@/store';
import * as types from '@/store/actions-type'

class AjaxRequest {
  constructor() {
    this.baseURL = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/api' : '/'
    this.timeout = 3000
    this.queue = {}
  }
  // 设置拦截器
  setInterceptor(instance, url) {
    // 请求拦截
    instance.interceptors.request.use((config) => { 
      // 每次请求前 将token 放到请求中
      config.token = localStorage.getItem('token') || '';
      // 每次请求的时候 都拿到一个取消请求的方法
      let Cancel = axios.CancelToken; // 产生一个请求令牌
      config.cancelToken = new Cancel(function (c) {
        store.commit(types.PUSH_TOKEN, c);
      });
      // 只要页面变化 就要去依次调用cancel方法 路由的钩子 beforeEach
      
      // 显示loading
      if (Object.keys(this.queue).length === 0) {
        this.toast = Toast.$create({
          txt: '正在加载',
          time: 0
        });
        this.toast.show(); 
      }
      // 请求前 增加请求队列
      this.queue[url] = url; 
      
      return config;
    }, err => {
      return Promise.reject(err);
    });
    
    // 响应拦截
    instance.interceptors.response.use((res) => { 
      // 关闭loading   还可以对返回的状态码做各种匹配
      delete this.queue[url]; //  请求完成后删除对应的url
      if (Object.keys(this.queue).length === 0) {
        this.toast.hide(); // 当队列被清空隐藏掉即可
      }
      if (res.data.code === 0) {
        return res.data.data
      } else { // 其他不是0的情况交给用户自己处理
        return Promise.reject(res.data)
      }
    }, err => {
      delete this.queue[url];
      if (Object.keys(this.queue).length === 0) {
        this.toast.hide(); 
      }
      return Promise.reject(err);
    })
  }
  request(options) {
    let instance = axios.create();
    let config = {
      ...options,
      baseURL: this.baseURL,
      timeout: this.timeout
    }
    
    this.setInterceptor(instance, options.url); 
    
    return instance(config); 
  }
}

export default new AjaxRequest
