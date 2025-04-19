<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧用户信息卡片 -->
      <el-col :xs="24" :sm="8" :md="6">
        <el-card class="user-card" :body-style="{ padding: '0px' }">
          <div class="user-card-header">
            <div class="user-cover"></div>
            <div class="user-avatar">
              <el-avatar :size="110" :src="userInfo.avatarUrl">
                {{ userInfo.nickname && userInfo.nickname.substring(0, 1).toUpperCase() }}
              </el-avatar>
            </div>
          </div>
          <div class="user-card-body">
            <h2 class="user-name">{{ userInfo.nickname || '未设置昵称' }}</h2>
            <div class="user-details">
              <p><i class="el-icon-user"></i> {{ userInfo.username }}</p>
              <p><i class="el-icon-time"></i> 注册于 {{ formatDate(userInfo.createTime) }}</p>
              <p v-if="userInfo.email"><i class="el-icon-message"></i> {{ userInfo.email }}</p>
            </div>
            <div class="user-actions">
              <el-button type="primary" @click="openEditUserDialog" round>
                编辑资料
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧主要内容区域 -->
      <el-col :xs="24" :sm="16" :md="18">
        <el-card class="main-content-card">
          <template #header>
            <div class="card-header">
              <h3>个人资料</h3>
            </div>
          </template>
          
          <el-descriptions 
            :column="2" 
            border 
            class="user-description"
            :size="screenWidth < 768 ? 'small' : 'default'">
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ userInfo.nickname || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间" :span="2">{{ formatDate(userInfo.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="上次更新" :span="2">{{ formatDate(userInfo.updateTime) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑用户信息对话框 -->
    <el-dialog
      v-model="showEditUserDialog"
      title="编辑个人信息"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像" prop="avatarUrl">
          <div class="avatar-upload-container">
            <el-avatar :size="80" :src="userForm.avatarUrl || defaultAvatar" class="avatar-preview">
              {{ userForm.nickname && userForm.nickname.substring(0, 1).toUpperCase() }}
            </el-avatar>
            <div class="avatar-actions">
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="uploadAvatar"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
              >
                <el-button type="primary" size="small" :loading="avatarUploading">选择图片</el-button>
              </el-upload>
              <div class="avatar-tip">推荐尺寸: 200x200px，支持jpg、png格式</div>
            </div>
          </div>
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
import { ref, onMounted, reactive, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { getCurrentUser, updateUserInfoService, uploadAvatar as uploadAvatarApi } from "../api/user.js"
import { formatDate } from '../utils/videoUtils'

const router = useRouter()
const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 头像上传相关变量
const avatarUploading = ref(false)
const uploadHeaders = computed(() => {
  return {
    Authorization: localStorage.getItem('token') || ''
  }
})

// 响应式屏幕宽度
const screenWidth = ref(window.innerWidth)
window.addEventListener('resize', () => {
  screenWidth.value = window.innerWidth
})

const userInfo = ref({
  nickname: '',
  username: '',
  avatarUrl: '',
  email: '',
  phone: '',
  createTime: '',
  updateTime: ''
})

// 如果用户未登录，重定向到首页
if (!userStore.isLoggedIn) {
  ElMessage.warning('请先登录')
  router.push('/')
}

// 页面状态
const loading = ref(false)
const updating = ref(false)
const showEditUserDialog = ref(false)
const showPasswordDialog = ref(false)
const changingPassword = ref(false)

// 编辑用户表单
const userFormRef = ref(null)
const userForm = reactive({
  nickname: '',
  avatarUrl: '',
  email: '',
  phone: ''
})

// 修改密码表单
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 在打开编辑对话框时初始化表单数据
const openEditUserDialog = () => {
  userForm.nickname = userInfo.value.nickname || ''
  userForm.avatarUrl = userInfo.value.avatarUrl || ''
  userForm.email = userInfo.value.email || ''
  userForm.phone = userInfo.value.phone || ''
  showEditUserDialog.value = true
}

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showPasswordDialog.value = true
}

// 打开安全设置对话框
const openSecuritySettingsDialog = () => {
  ElMessage.info('安全设置功能正在开发中')
}

// 用户表单验证规则
const userFormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 自定义上传头像
const uploadAvatar = async (options) => {
  const file = options.file
  
  try {
    avatarUploading.value = true
    const response = await uploadAvatarApi(file)
    
    if (response.success) {
      userForm.avatarUrl = response.data.avatarUrl
      // 更新本地显示的用户信息
      userInfo.value.avatarUrl = response.data.avatarUrl
      // 更新store中的用户信息
      userStore.updateUserInfo({
        avatarUrl: response.data.avatarUrl
      })
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(response.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请稍后重试')
  } finally {
    avatarUploading.value = false
  }
}

// 头像上传前检查
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('头像图片只能是JPG或PNG格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过2MB!')
    return false
  }
  return true
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
      userForm.email = userInfo.value.email || ''
      userForm.phone = userInfo.value.phone || ''
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
        avatarUrl: userForm.avatarUrl,
        email: userForm.email,
        phone: userForm.phone
      })
      
      if (response.success) {
        ElMessage.success('更新用户信息成功')
        // 更新本地显示的用户信息
        userInfo.value.nickname = userForm.nickname
        userInfo.value.avatarUrl = userForm.avatarUrl
        userInfo.value.email = userForm.email
        userInfo.value.phone = userForm.phone
        
        // 更新store中的用户信息
        userStore.updateUserInfo({
          nickname: userForm.nickname,
          avatarUrl: userForm.avatarUrl
        })

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
  max-width: 1200px;
  margin: 0 auto;
}

.user-card {
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.user-card-header {
  position: relative;
  height: 110px;
}

.user-cover {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-avatar {
  position: absolute;
  bottom: -55px;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.user-card-body {
  padding: 65px 20px 20px;
  text-align: center;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}

.user-details {
  margin-bottom: 20px;
}

.user-details p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.user-actions {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.main-content-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-description {
  margin-bottom: 30px;
}

.account-settings {
  margin-top: 40px;
}

.account-settings h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.setting-card {
  padding: 15px;
  margin-bottom: 20px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.setting-card h4 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #303133;
}

.setting-card p {
  color: #606266;
  font-size: 14px;
  margin: 0 0 15px;
  flex-grow: 1;
}

.avatar-upload-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-preview {
  border: 1px solid #eee;
  background-color: #f5f7fa;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .user-card-body {
    padding: 60px 10px 15px;
  }
  
  .setting-card {
    height: auto;
    padding: 12px;
  }
}
</style> 