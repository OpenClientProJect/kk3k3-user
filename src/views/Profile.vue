<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧用户信息卡片 -->
      <el-col :span="6">
        <el-card class="user-card">
          <div class="user-avatar">
            <el-avatar :size="100" :src="userInfo.avatarUrl" />
          </div>
          <div class="user-info">
            <h2>{{ userInfo.nickname }}</h2>
            <p>用户名: {{ userInfo.username }}</p>
            <p>注册时间: {{ formatDate(userInfo.createTime) }}</p>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ myVideoTotal || 0 }}</span>
              <span class="stat-label">发布视频</span>
            </div>
          </div>
          <div class="user-actions">
            <el-button type="primary" @click="openEditUserDialog">
              编辑个人信息
            </el-button>
            <el-button type="success" @click="showUploadDialog = true">
              <el-icon><VideoCamera /></el-icon>
              发布视频
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧内容区 -->
      <el-col :span="18">
        <div class="my-videos-section">
          <div class="my-videos-header">
            <h3>我的视频</h3>
            <el-button type="success" @click="showUploadDialog = true">
              <el-icon><Plus /></el-icon> 发布新视频
            </el-button>
          </div>
          
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="!myVideoList.length" class="empty-data">
            <el-empty description="您还没有发布过视频">
              <template #extra>
                <el-button type="primary" @click="showUploadDialog = true">立即发布</el-button>
              </template>
            </el-empty>
          </div>
          <div v-else class="video-list">
            <el-card v-for="item in myVideoList" :key="item.id" class="video-item">
              <div class="video-thumb" >
                <img :src="item.coverUrl" alt="视频封面" />
              </div>
              <div class="video-info">
                <h3 class="video-title" @click="goToVideo(item.id)">{{ item.title }}</h3>
                <p class="video-stats">
                  播放量: {{ item.views || 0 }} · 点赞: {{ item.likes || 0 }} 
                  <span class="category">{{ formatCategory(item.category) }}</span>
                </p>
                <p class="upload-time">发布于: {{ formatDate(item.createTime) }}</p>
                <div class="video-actions">
                  <el-button type="danger" size="small" @click="handleDeleteVideo(item.id)">删除</el-button>
                </div>
              </div>
            </el-card>
            <el-pagination
              v-if="myVideoTotal > 10"
              layout="prev, pager, next"
              :total="myVideoTotal"
              :page-size="10"
              @current-change="myVideoPageChange"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 编辑用户信息对话框 -->
    <el-dialog
      v-model="showEditUserDialog"
      title="编辑个人信息"
      width="400px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="头像URL" prop="avatarUrl">
          <el-input v-model="userForm.avatarUrl" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditUserDialog = false">取消</el-button>
          <el-button type="primary" @click="updateUserInfo" :loading="updating">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加发布视频对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="发布新视频"
      width="650px"
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
        <el-form-item label="视频标题" prop="title">
          <el-input v-model="uploadForm.title" placeholder="请输入视频标题" />
        </el-form-item>
        
        <el-form-item label="视频描述" prop="description">
          <el-input v-model="uploadForm.description" type="textarea" :rows="4" placeholder="请输入视频描述" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="封面图片" prop="coverUrl">
              <el-upload
                class="cover-uploader"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleCoverChange">
                <img v-if="coverPreview" :src="coverPreview" class="cover-preview" />
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="el-upload__tip">
                点击上传封面图片，支持jpg、png格式
              </div>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="视频文件" prop="videoFile">
              <el-upload
                class="video-uploader"
                action="#"
                :auto-upload="false"
                :show-file-list="true"
                :limit="1"
                :on-change="handleVideoChange"
                :on-exceed="handleExceed"
                :before-remove="handleBeforeRemove">
                <el-button type="primary">选择视频文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持mp4、avi、mov等常见视频格式
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="uploadForm.category" placeholder="请选择视频分类">
            <el-option label="科技" value="technology" />
            <el-option label="游戏" value="game" />
            <el-option label="音乐" value="music" />
            <el-option label="电影" value="movie" />
            <el-option label="动画" value="animation" />
            <el-option label="运动" value="sports" />
            <el-option label="美食" value="food" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-tag
            v-for="tag in uploadForm.tags"
            :key="tag"
            closable
            @close="handleRemoveTag(tag)"
            class="tag-item">
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInputRef"
            v-model="tagInput"
            class="tag-input"
            size="small"
            @keyup.enter="handleAddTag"
            @blur="handleAddTag"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
            + 新标签
          </el-button>
          <div class="el-upload__tip">最多添加5个标签</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" @click="handleUpload" :loading="uploading">发布视频</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/user'
import { Plus, VideoCamera } from '@element-plus/icons-vue'
import { uploadVideo, uploadCover, saveVideo, getMyVideos, deleteVideo as deleteVideoApi } from '../api/video'
import { getCurrentUser, updateUserInfoService } from "@/api/user.js"
import { formatDate, formatCategory, formatDuration } from '../utils/videoUtils'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userInfo = ref({
  nickname: '',
  username: '',
  avatarUrl: ''
})
// 如果用户未登录，重定向到首页
if (!userStore.isLoggedIn) {
  ElMessage.warning('请先登录')
  router.push('/')
}

// 用户统计数据 - 移除历史和收藏统计
const userStats = reactive({
  videoCount: 0
})

// 页面状态
const activeTab = ref('myVideos') // 默认显示我的视频标签页
const loading = ref(false)
const updating = ref(false)
const showEditUserDialog = ref(false)
const showUploadDialog = ref(false)

// 编辑用户表单
const userFormRef = ref(null)
const userForm = reactive({
  nickname: '',
  avatarUrl: ''
})

// 在打开编辑对话框时初始化表单数据
const openEditUserDialog = () => {
  userForm.nickname = userInfo.value.nickname || ''
  userForm.avatarUrl = userInfo.value.avatarUrl || ''
  showEditUserDialog.value = true
}

// 用户表单验证规则
const userFormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 视频相关变量
const uploadFormRef = ref(null)
const tagInputRef = ref(null)
const uploading = ref(false)
const tagInputVisible = ref(false)
const tagInput = ref('')
const coverPreview = ref('')
const myVideoList = ref([])
const myVideoTotal = ref(0)

const uploadForm = reactive({
  title: '',
  description: '',
  coverUrl: '',
  videoFile: null,
  category: '',
  tags: []
})

const uploadRules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入视频描述', trigger: 'blur' }
  ],
  videoFile: [
    { required: true, message: '请上传视频文件', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择视频分类', trigger: 'change' }
  ]
}


//获取用户信息
const getUserInfo = async () => {
  try {
    loading.value = true
    const response = await getCurrentUser()
    if (response.success && response.user) {
      userInfo.value = response.user
      // 更新表单初始值
      userForm.nickname = userInfo.value.nickname || ''
      userForm.avatarUrl = userInfo.value.avatarUrl || ''
    } else {
      ElMessage.warning('获取用户信息失败')
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 更新用户信息
const updateUserInfo = async () => {
  await userFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      updating.value = true
      const response = await updateUserInfoService(userInfo.value.id, {
        nickname: userForm.nickname,
        avatarUrl: userForm.avatarUrl
      })
      
      if (response.success) {
        ElMessage.success('更新用户信息成功')
        // 更新本地显示的用户信息
        userInfo.value.nickname = userForm.nickname
        userInfo.value.avatarUrl = userForm.avatarUrl

        showEditUserDialog.value = false
      } else {
        ElMessage.error(response.message || '更新用户信息失败')
      }
    } catch (error) {
      ElMessage.error('更新用户信息失败，请稍后重试')
    } finally {
      updating.value = false
    }
  })
}
// 处理封面图片上传
const handleCoverChange = (file) => {
  const isImage = file.raw.type.indexOf('image/') !== -1
  const isLt2M = file.raw.size / 1024 / 1024 < 20

  if (!isImage) {
    ElMessage.error('封面图片只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 20MB!')
    return false
  }

  // 显示预览
  uploadForm.coverFile = file.raw
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    coverPreview.value = reader.result
  }
}

// 处理视频文件上传
const handleVideoChange = (file) => {
  const isVideo = /\.(mp4|avi|mov|wmv|flv|mkv)$/i.test(file.name)
  const isLt500M = file.raw.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('请上传正确的视频格式!')
    return false
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB!')
    return false
  }

  uploadForm.videoFile = file.raw
}

// 处理文件数量超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个视频文件')
}

// 处理文件移除前的确认
const handleBeforeRemove = () => {
  return ElMessageBox.confirm('确定移除已选择的视频文件?')
}

// 显示标签输入框
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value.focus()
  })
}

// 添加标签
const handleAddTag = () => {
  const value = tagInput.value.trim()
  if (value) {
    if (uploadForm.tags.length >= 5) {
      ElMessage.warning('最多添加5个标签')
    } else if (uploadForm.tags.includes(value)) {
      ElMessage.warning('标签已存在')
    } else {
      uploadForm.tags.push(value)
    }
  }
  tagInputVisible.value = false
  tagInput.value = ''
}

// 移除标签
const handleRemoveTag = (tag) => {
  uploadForm.tags = uploadForm.tags.filter(item => item !== tag)
}

// 上传视频
const handleUpload = async () => {
  if (!uploadForm.videoFile) {
    ElMessage.error('请选择视频文件')
    return
  }

  await uploadFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      uploading.value = true
      
      // 1. 上传视频文件
      const videoResponse = await uploadVideo(uploadForm.videoFile)
      
      if (!videoResponse.success) {
        ElMessage.error('视频上传失败: ' + videoResponse.message)
        uploading.value = false
        return
      }
      
      // 2. 上传封面图片
      let coverResponse = null
      if (uploadForm.coverFile) {
        coverResponse = await uploadCover(uploadForm.coverFile)
        
        if (!coverResponse.success) {
          ElMessage.error('封面上传失败: ' + coverResponse.message)
          uploading.value = false
          return
        }
      }
      
      // 3. 保存视频信息
      const videoData = {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        videoPath: videoResponse.data.relativePath,
        videoUrl: videoResponse.data.videoUrl,
        coverPath: coverResponse ? coverResponse.data.relativePath : null,
        coverUrl: coverResponse ? coverResponse.data.coverUrl : null,
        tags: uploadForm.tags.join(',')
      }
      
      const saveResponse = await saveVideo(videoData)
      
      if (!saveResponse.success) {
        ElMessage.error('视频信息保存失败: ' + saveResponse.message)
        uploading.value = false
        return
      }
      
      ElMessage.success('视频发布成功')
      showUploadDialog.value = false
      resetUploadForm()
      
      // 加载我的视频列表
      await loadMyVideos()
      uploading.value = false
    } catch (error) {
      console.error('视频上传失败:', error)
      ElMessage.error('视频上传失败，请稍后重试')
      uploading.value = false
    }
  })
}

// 重置上传表单
const resetUploadForm = () => {
  uploadFormRef.value && uploadFormRef.value.resetFields()
  uploadForm.title = ''
  uploadForm.description = ''
  uploadForm.coverUrl = ''
  uploadForm.videoFile = null
  uploadForm.category = ''
  uploadForm.tags = []
  coverPreview.value = ''
}

// 加载我的视频列表
const loadMyVideos = async (page = 1) => {
  loading.value = true
  try {
    const response = await getMyVideos(page, 10)
    
    if (response.success) {
      myVideoList.value = response.data.videos
      myVideoTotal.value = response.data.total
      // 更新用户统计
      userStats.videoCount = myVideoTotal.value
    } else {
      ElMessage.error('获取视频列表失败: ' + response.message)
      myVideoList.value = []
      myVideoTotal.value = 0
    }
    
    loading.value = false
  } catch (error) {
    ElMessage.error('获取视频列表失败，请稍后重试')
    loading.value = false
    myVideoList.value = []
    myVideoTotal.value = 0
  }
}


// 删除视频
const handleDeleteVideo = (videoId) => {
  ElMessageBox.confirm('确定要删除这个视频吗？此操作不可逆', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteVideoApi(videoId)
      
      if (response.success) {
        myVideoList.value = myVideoList.value.filter(item => item.id !== videoId)
        myVideoTotal.value--
        userStats.videoCount = myVideoTotal.value
        ElMessage.success('视频已删除')
      } else {
        ElMessage.error('删除视频失败: ' + response.message)
      }
    } catch (error) {
      console.error('删除视频失败:', error)
      ElMessage.error('删除视频失败，请稍后重试')
    }
  }).catch(() => {})
}

// 我的视频分页切换
const myVideoPageChange = (page) => {
  loadMyVideos(page)
}

// 页面加载时初始化数据
onMounted(() => {
  if (userStore.isLoggedIn) {
    getUserInfo()
    loadMyVideos()
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.user-card {
  text-align: center;
  padding: 20px;
}

.user-avatar {
  margin-bottom: 20px;
}

.user-info {
  margin-bottom: 20px;
}

.user-info h2 {
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.user-info p {
  margin: 5px 0;
  color: #666;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.user-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.profile-tabs {
  margin-bottom: 20px;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.video-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.video-item:hover {
  transform: translateY(-5px);
}

.video-thumb {
  position: relative;
  height: 180px;
  overflow: hidden;
  margin-bottom: 10px;
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 0.8rem;
}

.video-title {
  margin: 0 0 5px 0;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-uploader,
.watch-time,
.favorite-time {
  margin: 5px 0;
  font-size: 0.8rem;
  color: #999;
}

.loading-container {
  padding: 20px;
}

.empty-data {
  padding: 40px 0;
  text-align: center;
}

.el-pagination {
  margin-top: 20px;
  text-align: center;
}

.my-videos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.my-videos-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.my-videos-section {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.cover-uploader {
  width: 100%;
  height: 169px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.tag-input {
  width: 120px;
  margin-right: 10px;
  vertical-align: top;
}

.button-new-tag {
  margin-bottom: 10px;
}

.video-stats {
  font-size: 0.8rem;
  color: #888;
  margin: 5px 0;
}

.video-stats .category {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #606266;
  display: inline-block;
  margin-left: 5px;
}

.upload-time {
  font-size: 0.8rem;
  color: #999;
  margin: 5px 0;
}

.video-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-actions {
    flex-direction: column;
  }
  
  .el-row {
    display: flex;
    flex-direction: column;
  }
  
  .el-col {
    width: 100% !important;
  }
}
</style> 