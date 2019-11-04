import axios from '@/utils/ajaxRequest'
import store from '@/store'

// 获取课程分类
export const fetchCategory = () => {
  return axios.request({
    url: '/category'
  })
}

// 获取轮播图
export const fetchSlides = () => {
  return axios.request({
    url: '/slides'
  })
}

// 获取列表对应的数据
export const fetchLessonList = (size, offset) => {
  let { state: { home: { currentLesson } } } = store
  return axios.request({
    url: `/lessonList/${currentLesson}?size=${size}&offset=${offset}`
  })
}
