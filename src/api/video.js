import request from '../utils/request'


/**
 * 获取视频详情
 * @param {number} id - 视频ID
 * @returns {Promise} 响应结果
 */
export function getVideoDetail(id) {
  return request({
    url: `/api/video/${id}`,
    method: 'get'
  })
}

/**
 * 获取最新视频
 * @returns {Promise} 响应结果
 */
export function getLatestVideos() {
  return request({
    url: '/api/video/latest',
    method: 'get',
  })
}


/**
 * 搜索视频
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @returns {Promise} 响应结果
 */
export function searchVideos(keyword, page = 1, size = 8) {
  return request({
    url: '/api/video/search',
    method: 'get',
    params: { keyword, page, size }
  })
} 