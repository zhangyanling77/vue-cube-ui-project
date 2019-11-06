// 实现loading效果
import Loading from '@/components/Loading'
const loadable = (asyncFunction) => {
  const component = () => ({
    component: asyncFunction(), // 得到异步加载的组件
    loading: Loading
  })

  return { // cli 默认不支持模板，所有使用render，而不是template
    render(h) {
      return h(component)
    }
  }
}

export default loadable
