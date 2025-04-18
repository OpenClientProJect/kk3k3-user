import request from '../utils/request'

/**
 * 获取最新动态列表
 * @param {number} page 页码
 * @param {number} size 每页大小
 * @returns {Promise}
 */
export function getLatestDynamics(page = 1, size = 10) {
  return request({
    url: '/api/dynamic/list',
    method: 'get',
    params: { page, size }
  })
}

/**
 * 获取用户动态列表
 * @param {number} userId 用户ID
 * @param {number} page 页码
 * @param {number} size 每页大小
 * @returns {Promise}
 */
export function getUserDynamics(userId, page = 1, size = 10) {
  return request({
    url: `/api/dynamic/user/${userId}`,
    method: 'get',
    params: { page, size }
  })
}

/**
 * 获取动态详情
 * @param {number} dynamicId 动态ID
 * @returns {Promise}
 */
export function getDynamicDetail(dynamicId) {
  return request({
    url: `/api/dynamic/${dynamicId}`,
    method: 'get'
  })
}

/**
 * 发布动态
 * @param {object} data 动态内容
 * @returns {Promise}
 */
export function publishDynamic(data) {
  return request({
    url: '/api/dynamic/publish',
    method: 'post',
    data
  })
}

/**
 * 上传动态图片
 * @param {File} file 图片文件
 * @returns {Promise}
 */
export function uploadDynamicImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/dynamic/upload-image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 点赞/取消点赞动态
 * @param {number} dynamicId 动态ID
 * @returns {Promise}
 */
export function likeDynamic(dynamicId) {
  return request({
    url: `/api/dynamic/like/${dynamicId}`,
    method: 'post'
  })
}

/**
 * 删除动态
 * @param {number} dynamicId 动态ID
 * @returns {Promise}
 */
export function deleteDynamic(dynamicId) {
  return request({
    url: `/api/dynamic/${dynamicId}`,
    method: 'delete'
  })
}

/**
 * 获取动态评论
 * @param {number} dynamicId 动态ID
 * @param {number} page 页码
 * @param {number} size 每页大小
 * @returns {Promise}
 */
export function getDynamicComments(dynamicId, page = 1, size = 10) {
  return request({
    url: `/api/dynamic/${dynamicId}/comments`,
    method: 'get',
    params: { page, size }
  })
}

/**
 * 发表评论
 * @param {number} dynamicId 动态ID
 * @param {string} content 评论内容
 * @param {number} parentId 父评论ID（回复评论时使用）
 * @returns {Promise}
 */
export function commentDynamic(dynamicId, content, parentId = null) {
  return request({
    url: `/api/dynamic/${dynamicId}/comment`,
    method: 'post',
    data: { content, parentId }
  })
}

/**
 * 删除评论
 * @param {number} commentId 评论ID
 * @returns {Promise}
 */
export function deleteDynamicComment(commentId) {
  return request({
    url: `/api/dynamic/comment/${commentId}`,
    method: 'delete'
  })
} 