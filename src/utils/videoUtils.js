/**
 * 视频相关工具函数
 */

// 视频分类映射表
export const categoryMap = {
  'technology': '科技',
  'game': '游戏',
  'music': '音乐',
  'movie': '电影',
  'animation': '动画',
  'sports': '运动',
  'food': '美食',
  'other': '其他'
}

/**
 * 将分类英文代码转换为中文名称
 * @param {string} category - 分类代码
 * @returns {string} 分类中文名称
 */
export function formatCategory(category) {
  return categoryMap[category] || category || '未分类'
}

/**
 * 格式化数字（如：1000 -> 1k）
 * @param {number} num - 需要格式化的数字
 * @returns {string|number} 格式化后的数字
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
  if (!date) return '未知'
  const d = new Date(date)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 格式化时长
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时长
 */
export function formatDuration(seconds) {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 处理头像URL，确保完整显示
 * @param {string} avatarUrl - 头像URL
 * @returns {string} 处理后的头像URL
 */
export function formatAvatarUrl(avatarUrl) {
  if (!avatarUrl) {
    return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }
  
  // 如果已经是完整URL，直接返回
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
    return avatarUrl
  }

  // 将相对路径转换为绝对路径
  return `http://localhost:8080${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`
} 