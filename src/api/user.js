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
 * 刷新令牌
 * @returns {Promise} 响应结果，包含新的令牌
 */
export function refreshToken() {
  return request({
    url: '/api/account/refresh-token',
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
 * 获取用户信息
 * @param {number} id - 用户ID
 * @returns {Promise} 响应结果
 */
export function getUserInfo(id) {
  return request({
    url: `/api/user/${id}`,
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
 * 获取所有用户（管理员使用）
 * @returns {Promise} 响应结果
 */
export function getAllUsers() {
  return request({
    url: '/api/user/list',
    method: 'get'
  })
}

/**
 * 关注用户
 * @param {number} targetUserId - 要关注的用户ID
 * @returns {Promise} 响应结果
 */
export function subscribeUser(targetUserId) {
  return request({
    url: `/api/user/subscribe/${targetUserId}`,
    method: 'post'
  })
}

/**
 * 取消关注用户
 * @param {number} targetUserId - 要取消关注的用户ID
 * @returns {Promise} 响应结果
 */
export function unsubscribeUser(targetUserId) {
  return request({
    url: `/api/user/subscribe/${targetUserId}`,
    method: 'delete'
  })
}

/**
 * 检查是否已关注用户
 * @param {number} targetUserId - 目标用户ID
 * @returns {Promise} 响应结果
 */
export function isSubscribed(targetUserId) {
  console.log(`发起检查订阅状态请求，目标用户ID: ${targetUserId}`);
  
  return request({
    url: `/api/user/is-subscribed/${targetUserId}`,
    method: 'get'
  })
  .then(response => {
    console.log(`订阅状态请求成功，返回数据:`, response);
    return response;
  })
  .catch(error => {
    console.error(`检查订阅状态失败，目标用户ID: ${targetUserId}，错误:`, error);
    
    // 如果是401错误（未认证），保留错误码以便前端能特殊处理
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        code: 401,
        data: false,
        message: '用户未登录'
      };
    }
    
    // 其他错误返回默认响应
    return {
      success: false,
      data: false,
      message: error.message || '获取订阅状态失败'
    };
  });
}

/**
 * 获取用户的粉丝数
 * @param {number} userId - 用户ID
 * @returns {Promise} 响应结果
 */
export function getSubscriberCount(userId) {
  return request({
    url: `/api/user/${userId}/subscriber-count`,
    method: 'get'
  })
} 