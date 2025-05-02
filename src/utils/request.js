import axios from 'axios'
import {ElMessage} from 'element-plus'
import {useUserStore} from "@/store/user.js";
import router from "@/router/index.js";

// 创建axios实例
const request = axios.create({
  baseURL: 'http://154.40.44.245:8080',
  timeout: 10000,  // 请求超时时间
  withCredentials: true // 允许跨域携带cookie
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 确保headers对象存在
      config.headers = config.headers || {}
      // 直接使用token，不添加Bearer前缀（后端会添加）
      config.headers['Authorization'] = token
      
      // 添加调试日志
      console.log(`发送请求到 ${config.url} 时附加认证Token: ${token.substring(0, 15)}...`);
    } else {
      console.log(`发送请求到 ${config.url} 时未附加Token（用户未登录）`);
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
      return response.data
  },
  error => {
    console.error('响应错误:', error)
    let message = error.message
    if (error.response && error.response.data) {
      message = error.response.data.message || message
    } else if (error.response.status === 401) {
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
        ElMessage.error('登录状态已过期，请重新登录')
    }
    ElMessage.error(message || '请求失败')
    return Promise.reject(error)
  }
)

export default request 