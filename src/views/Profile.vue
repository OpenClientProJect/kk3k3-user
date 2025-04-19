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
          <div class="user-actions">
            <el-button type="primary" @click="openEditUserDialog">
              编辑个人信息
            </el-button>
          </div>
        </el-card>
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
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/user'
import { uploadVideo, uploadCover, saveVideo, getMyVideos, deleteVideo as deleteVideoApi } from '../api/video'
import { getCurrentUser, updateUserInfoService } from "@/api/user.js"
import { formatDate } from '../utils/videoUtils'

const router = useRouter()
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


// 页面加载时初始化数据
onMounted(() => {
  if (userStore.isLoggedIn) {
    getUserInfo()
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


.user-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}


.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.my-videos-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-actions {
    flex-direction: column;
  }
}
</style> 