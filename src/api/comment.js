import request from '../utils/request'

/**
 * 获取视频评论列表
 * @param {number} videoId - 视频ID
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @returns {Promise} 响应结果
 */
export function getVideoComments(videoId, page = 1, size = 10) {
  return request({
    url: `/api/comment/video/${videoId}`,
    method: 'get',
    params: { page, size }
  })
}

/**
 * 发表评论
 * @param {Object} data - 评论数据，包含videoId和content
 * @returns {Promise} 响应结果
 */
export function postComment(data) {
  return request({
    url: '/api/comment',
    method: 'post',
    data
  })
}

/**
 * 删除评论
 * @param {number} commentId - 评论ID
 * @returns {Promise} 响应结果
 */
export function deleteComment(commentId) {
  return request({
    url: `/api/comment/${commentId}`,
    method: 'delete'
  })
}

/**
 * 回复评论
 * @param {Object} data - 回复数据，包含videoId, content和parentId
 * @returns {Promise} 响应结果
 */
export function replyComment(data) {
  return request({
    url: '/api/comment/reply',
    method: 'post',
    data
  })
}

/**
 * 点赞评论
 * @param {number} commentId - 评论ID
 * @returns {Promise} 响应结果
 */
export function likeComment(commentId) {
  return request({
    url: `/api/comment/${commentId}/like`,
    method: 'post'
  })
}

/**
 * 取消点赞评论
 * @param {number} commentId - 评论ID
 * @returns {Promise} 响应结果
 */
export function unlikeComment(commentId) {
  return request({
    url: `/api/comment/${commentId}/unlike`,
    method: 'post'
  })
} 