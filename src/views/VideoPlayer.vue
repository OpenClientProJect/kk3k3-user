<template>
  <div class="video-player-page">
    <el-container>
      <el-main>
        <div v-if="loading" class="loading-container">
          <el-skeleton animated>
            <template #template>
              <div class="video-skeleton">
                <el-skeleton-item variant="rect" style="width: 100%; height: 500px;"/>
                <div style="padding: 14px;">
                  <el-skeleton-item variant="h3" style="width: 50%;"/>
                  <div style="display: flex; align-items: center; margin-top: 16px;">
                    <el-skeleton-item variant="text" style="margin-right: 16px;"/>
                    <el-skeleton-item variant="text" style="width: 30%;"/>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <div v-else>
          <div class="video-container">
            <video
                ref="videoPlayer"
                controls
                class="video-player"
                :src="video.videoUrl"
                :poster="video.coverUrl || 'https://via.placeholder.com/1280x720'"
            ></video>
          </div>

          <div class="video-details">
            <h1>{{ video.title }}</h1>
            <div class="video-info-row">
              <p class="video-stats">
                <span>发布日期：{{ formatDate(video.createTime) }}</span>
              </p>
              <div class="video-actions-simple">
                <el-button
                  type="primary"
                  :icon="Share"
                  size="small"
                  plain
                  @click="handleShareVideo">
                  分享
                </el-button>
              </div>
            </div>

            <el-divider/>

            <p class="video-description">简介：{{ video.description }}</p>
            <p v-if="video.tags" class="video-tags">
              <el-tag v-for="tag in getTagList(video.tags)" :key="tag" size="small" effect="plain" class="tag">
                标签： {{ tag }}
              </el-tag>
            </p>
          </div>

          <div class="comments-section">
            <h2>评论 ({{ totalComments }})</h2>

            <div v-if="isLoggedIn" class="comment-form">
              <el-avatar :size="40" :src="userStore.avatar" class="comment-avatar"/>
              <el-input
                  v-model="commentContent"
                  type="textarea"
                  :rows="2"
                  placeholder="发表评论..."
                  resize="none"
              />
              <el-button
                  type="primary"
                  :disabled="!commentContent.trim()"
                  @click="submitComment"
                  :loading="submittingComment"
              >
                发表
              </el-button>
            </div>
            <div v-else class="login-to-comment">
              请
              <el-button type="text" @click="openLoginDialog">登录</el-button>
              后发表评论
            </div>

            <div v-if="comments.length > 0" class="comments-list">
              <el-divider/>
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :size="40" :src="comment.userAvatar || defaultAvatar" class="comment-avatar"/>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.username }}</span>
                    <span class="comment-time">{{ formatCommentDate(comment.createTime) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <el-button
                        type="text"
                        size="small"
                        @click="toggleReplyForm(comment.id)"
                    >
                      回复
                    </el-button>
                    <el-button
                        v-if="canDeleteComment(comment)"
                        type="text"
                        size="small"
                        @click="removeComment(comment.id)"
                    >
                      删除
                    </el-button>
                  </div>

                  <div v-if="replyingTo === comment.id" class="reply-form">
                    <el-input
                        v-model="replyContent"
                        type="textarea"
                        :rows="2"
                        placeholder="回复评论..."
                        resize="none"
                        size="small"
                    />
                    <div class="reply-actions">
                      <el-button size="small" @click="cancelReply">取消</el-button>
                      <el-button
                          type="primary"
                          size="small"
                          :disabled="!replyContent.trim()"
                          @click="submitReply(comment.id)"
                          :loading="submittingReply"
                      >
                        回复
                      </el-button>
                    </div>
                  </div>

                  <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                      <el-avatar :size="30" :src="reply.userAvatar || defaultAvatar" class="reply-avatar"/>
                      <div class="reply-content">
                        <div class="reply-header">
                          <span class="reply-author">{{ reply.username }}</span>
                          <span class="reply-time">{{ formatCommentDate(reply.createTime) }}</span>
                        </div>
                        <p class="reply-text">{{ reply.content }}</p>
                        <div class="reply-actions">
                          <el-button
                              v-if="canDeleteComment(reply)"
                              type="text"
                              size="small"
                              @click="removeComment(reply.id)"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pagination" v-if="totalComments > 10">
                <el-pagination
                    layout="prev, pager, next"
                    :total="totalComments"
                    :page-size="10"
                    @current-change="handleCommentPageChange"
                />
              </div>
            </div>
            <div v-else-if="!loadingComments" class="no-comments">
              暂无评论，快来发表第一条评论吧！
            </div>
            <div v-else class="loading-comments">
              <el-skeleton animated :rows="3"/>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Star, Share} from '@element-plus/icons-vue'
import {getVideoDetail,  getLatestVideos} from '../api/video'
import {useUserStore} from '../store/user'
import {getVideoComments, postComment, deleteComment, replyComment, likeComment as likeCommentApi} from '../api/comment'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const videoPlayer = ref(null)
const loading = ref(true)
const isSubscribed = ref(false) // 是否已关注
const likeClicked = ref(false) // 是否已点赞
const video = ref({
  id: null,
  title: '',
  description: '',
  videoUrl: '',
  coverUrl: '',
  views: 0,
  likes: 0,
  createTime: null,
  uploaderName: '',
  userId: null,
  category: '',
  tags: ''
})
const relatedVideos = ref([])
const viewIncremented = ref(false)
const shareDialogVisible = ref(false)
const shareUrl = computed(() => window.location.href)

// 计算用户是否登录
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 计算当前用户是否是视频上传者
const isCurrentUser = computed(() => {
  return isLoggedIn.value && userStore.user && userStore.user.id === video.value.userId
})

// 评论相关变量
const comments = ref([])
const totalComments = ref(0)
const loadingComments = ref(false)
const commentContent = ref('')
const submittingComment = ref(false)
const replyingTo = ref(null)
const replyContent = ref('')
const submittingReply = ref(false)
const commentPage = ref(1)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 加载视频详情
const loadVideoDetail = async () => {
  try {
    loading.value = true
    const videoId = route.params.id

    if (!videoId) {
      ElMessage.error('视频ID无效')
      router.push('/')
      return
    }

    console.log('正在加载视频ID:', videoId)
    const response = await getVideoDetail(videoId)
    console.log('视频详情接口返回数据:', response)

    if (response.success && response.data && response.data.video) {
      const videoData = response.data.video

      // 设置默认值，避免null值导致的问题
      video.value = {
        id: videoData.id,
        title: videoData.title || '无标题视频',
        description: videoData.description || '暂无描述',
        videoUrl: videoData.videoUrl,
        coverUrl: videoData.coverUrl,
        views: videoData.views || 0,
        likes: videoData.likes || 0,
        createTime: videoData.createTime,
        // 使用默认值处理null的情况
        uploaderName: videoData.uploaderName || '未知上传者',
        userId: videoData.userId || 0,
        category: videoData.category || '未分类',
        tags: videoData.tags || '',
        tagList: videoData.tagList || []
      }

      // 不依赖上传者信息，直接加载相关视频
      await loadRelatedVideos()
    } else {
      ElMessage.error(response.message || '获取视频详情失败')
      await router.push('/')
    }
  } catch (error) {
    console.error('视频详情加载错误:', error)
    ElMessage.error('获取视频详情失败，请稍后重试')
    await router.push('/')
  } finally {
    loading.value = false
  }
}

// 加载相关视频
const loadRelatedVideos = async () => {
  try {
    // 如果有分类，则加载同类视频；否则加载最新视频
    if (video.value.category && video.value.category !== '未分类') {
      const response = await getVideosByCategory(video.value.category, 1, 4)

      if (response.success && response.data && response.data.videos) {
        // 过滤掉当前视频
        relatedVideos.value = response.data.videos.filter(item => item.id !== video.value.id).slice(0, 4)
      }
    } else {
      // 如果没有分类，则加载最新视频
      const response = await getLatestVideos()

      if (response.success && response.data && response.data.videos) {
        // 过滤掉当前视频
        relatedVideos.value = response.data.videos.filter(item => item.id !== video.value.id).slice(0, 4)
      }
    }
  } catch (error) {
    console.error('加载相关视频失败:', error)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取标签列表
const getTagList = (tags) => {
  if (!tags) return []
  return tags.split(',')
}

// 处理分享视频
const handleShareVideo = () => {
  // 创建一个临时输入框
  const input = document.createElement('input')
  input.value = shareUrl.value
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)

  ElMessage.success('视频链接已复制到剪贴板')
}


// 打开登录对话框
const openLoginDialog = () => {
  // 重定向到登录页面
  router.push({
    path: '/',
    query: {login: 'true', redirect: router.currentRoute.value.fullPath}
  });
}

// 加载评论列表
const loadComments = async (page = 1) => {
  if (!video.value.id) return

  try {
    loadingComments.value = true
    commentPage.value = page

    const response = await getVideoComments(video.value.id, page, 10)

    if (response.success) {
      comments.value = response.data.comments || []
      totalComments.value = response.data.total || 0
    } else {
      ElMessage.error('获取评论失败: ' + response.message)
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('获取评论失败，请稍后重试')
  } finally {
    loadingComments.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!isLoggedIn.value) {
    ElMessage({
      message: '请先登录后再评论',
      type: 'warning',
      onClose: () => {
        openLoginDialog();
      }
    });
    return;
  }

  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    submittingComment.value = true

    const response = await postComment({
      videoId: video.value.id,
      content: commentContent.value.trim()
    })

    if (response.success) {
      ElMessage.success('评论发表成功')
      commentContent.value = ''
      // 重新加载评论列表
      await loadComments(1)
    } else {
      ElMessage.error('评论发表失败: ' + response.message)
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    ElMessage.error('评论发表失败，请稍后重试')
  } finally {
    submittingComment.value = false
  }
}

// 切换回复表单
const toggleReplyForm = (commentId) => {
  if (!isLoggedIn.value) {
    ElMessage({
      message: '请先登录后再回复',
      type: 'warning',
      onClose: () => {
        openLoginDialog();
      }
    });
    return;
  }

  if (replyingTo.value === commentId) {
    replyingTo.value = null
    replyContent.value = ''
  } else {
    replyingTo.value = commentId
    replyContent.value = ''
  }
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

// 提交回复
const submitReply = async (commentId) => {
  if (!isLoggedIn.value) {
    ElMessage({
      message: '请先登录后再回复',
      type: 'warning',
      onClose: () => {
        openLoginDialog();
      }
    });
    return;
  }

  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  try {
    submittingReply.value = true

    const response = await replyComment({
      videoId: video.value.id,
      parentId: commentId,
      content: replyContent.value.trim()
    })

    if (response.success) {
      ElMessage.success('回复发表成功')
      replyContent.value = ''
      replyingTo.value = null
      // 重新加载评论列表
      await loadComments(commentPage.value)
    } else {
      ElMessage.error('回复发表失败: ' + response.message)
    }
  } catch (error) {
    console.error('提交回复失败:', error)
    ElMessage.error('回复发表失败，请稍后重试')
  } finally {
    submittingReply.value = false
  }
}

// 删除评论
const removeComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteComment(commentId)

    if (response.success) {
      ElMessage.success('评论已删除')
      // 重新加载评论列表
      await loadComments(commentPage.value)
    } else {
      ElMessage.error('删除评论失败: ' + response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败，请稍后重试')
    }
  }
}


// 在评论列表中查找评论
const findComment = (commentId) => {
  // 在主评论中查找
  let comment = comments.value.find(c => c.id === commentId)
  if (comment) return comment

  // 在回复中查找
  for (const c of comments.value) {
    if (c.replies) {
      comment = c.replies.find(r => r.id === commentId)
      if (comment) return comment
    }
  }

  return null
}

// 检查是否可以删除评论
const canDeleteComment = (comment) => {
  if (!isLoggedIn.value || !userStore.user) return false

  // 当前用户是评论作者，或者是视频上传者
  return userStore.user.id === comment.userId ||
      (video.value.userId && userStore.user.id === video.value.userId)
}

// 评论分页切换
const handleCommentPageChange = (page) => {
  loadComments(page)
}

// 格式化评论日期
const formatCommentDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()

  // 计算时间差（毫秒）
  const diff = now - date

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }

  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }

  // 小于30天
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }

  // 大于30天，显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 在加载视频详情后，加载评论列表
watch(() => video.value.id, (newId) => {
  if (newId) {
    loadComments(1)
  }
})

// 组件挂载时加载视频详情
onMounted(() => {
  loadVideoDetail()
})

// 监听路由参数变化，当视频ID变化时重新加载
watch(
    () => route.params.id,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
        console.log('视频ID变化，重新加载视频:', newId);
        // 重置状态
        isSubscribed.value = false;
        likeClicked.value = false;
        viewIncremented.value = false;
        // 直接加载新视频，API会返回完整的用户信息
        loadVideoDetail();
      }
    }
)


</script>

<style scoped>
.loading-container {
  width: 100%;
  margin-bottom: 20px;
}

.video-skeleton {
  width: 100%;
}

.video-container {
  width: 100%;
  margin-bottom: 20px;
  background-color: #000;
  display: flex;
  justify-content: center;
}

.video-player {
  width: 100%;
  max-height: 70vh;
  background-color: #000;
}

.video-details {
  margin-bottom: 30px;
}

.video-details h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.video-stats {
  color: #666;
  font-size: 14px;
}

.video-stats span {
  margin-right: 15px;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.author-avatar-container {
  margin-right: 15px;
  cursor: pointer;
}

.author-details {
  flex: 1;
}

.author-name {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.author-name:hover {
  color: #409EFF;
}

.upload-date {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.subscriber-count {
  color: #666;
  font-size: 13px;
  margin: 0;
}

.video-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.video-description {
  white-space: pre-line;
  line-height: 1.5;
}

.video-tags {
  margin-top: 15px;
}

.tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.related-videos h2 {
  margin-bottom: 20px;
}

.video-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.video-card:hover {
  transform: translateY(-5px);
}

.video-thumbnail {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.video-info {
  padding: 10px 0;
}

.video-info h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}

.dot {
  margin: 0 5px;
}

.el-main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 评论区样式 */
.comments-section {
  margin-top: 30px;
  margin-bottom: 30px;
}

.comments-section h2 {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.comment-form {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.comment-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.comment-form .el-input {
  flex: 1;
  margin-right: 12px;
}

.login-to-comment {
  padding: 15px;
  background-color: #f9f9f9;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 20px;
}

.comment-item {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.comment-content {
  flex: 1;
  margin-left: 12px;
}

.comment-header {
  margin-bottom: 5px;
}

.comment-author {
  font-weight: 600;
  margin-right: 8px;
}

.comment-time {
  color: #909399;
  font-size: 13px;
}

.comment-text {
  margin: 5px 0;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  margin-top: 5px;
  display: flex;
  gap: 12px;
}

.reply-form {
  margin-top: 10px;
  margin-bottom: 15px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 8px;
}

.replies-list {
  margin-top: 15px;
  margin-left: 20px;
  padding-left: 15px;
  border-left: 2px solid #eee;
}

.reply-item {
  display: flex;
  margin-bottom: 12px;
}

.reply-avatar {
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  margin-left: 10px;
}

.reply-header {
  margin-bottom: 3px;
}

.reply-author {
  font-weight: 600;
  margin-right: 8px;
}

.reply-time {
  color: #909399;
  font-size: 12px;
}

.reply-text {
  margin: 3px 0;
  line-height: 1.4;
  font-size: 14px;
}

.reply-actions {
  margin-top: 3px;
}

.no-comments, .loading-comments {
  padding: 30px 0;
  text-align: center;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.video-actions-simple {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 15px 0;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.video-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.video-info-row .video-stats {
  margin: 0;
}

.video-info-row .video-actions-simple {
  margin: 0;
  padding: 0;
  background-color: transparent;
}
</style>
