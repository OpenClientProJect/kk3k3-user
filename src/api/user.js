import request from '../utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录数据，包含username和password
 * @returns {Promise} 响应结果
 */
export function login(data) {
  return request({
    url: '/api/account/login',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册数据，包含username、password等信息
 * @returns {Promise} 响应结果
 */
export function register(data) {
  return request({
    url: '/api/account/register',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 * @returns {Promise} 响应结果
 */
export function logout() {
  return request({
    url: '/api/account/logout',
    method: 'post'
  })
}

/**
 * 获取当前登录用户信息
 * @returns {Promise} 响应结果
 */
export function getCurrentUser() {
  return request({
    url: '/api/user/current',
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {number} id - 用户ID
 * @param {Object} data - 更新的用户数据
 * @returns {Promise} 响应结果
 */
export function updateUserInfoService(id, data) {
  return request({
    url: `/api/user/${id}`,
    method: 'put',
    data
  })
}

/**
 * 上传用户头像
 * @param {File} file - 头像图片文件
 * @returns {Promise} 响应结果
 */
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/user/avatar/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true,
    data: formData
  })
}

