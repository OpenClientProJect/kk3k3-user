<template>
  <el-header>
    <el-menu
        mode="horizontal"
        :ellipsis="false"
        class="nav-menu"
        router
        :default-active="activeIndex"
    >
      <div class="logo-container" @click="goToHome">
        <img src="../assets/Logo.svg" class="logo" alt="Logo"/>
        视频平台
      </div>
      
      <!-- 导航菜单项 -->
      <el-menu-item index="/">首页</el-menu-item>

      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索视频"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div class="flex-grow"/>

      <!-- 未登录状态 -->
      <div v-if="!userStore.isLoggedIn" class="user-auth-wrapper">
        <el-button
            text
            class="login-btn"
            @click="openLoginDialog"
        >
          <el-icon>
            <Avatar/>
          </el-icon>
          <span class="login-text">登录/注册</span>
        </el-button>
      </div>

      <!-- 已登录状态 -->
      <el-dropdown v-else trigger="click" @command="handleCommand" class="user-dropdown">
        <div class="user-avatar-container">
          <el-avatar :size="32" :src="userInfo?.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"/>
          <span class="username">{{ userStore.nickname }}</span>
          <el-icon class="el-icon--right">
            <arrow-down/>
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon>
                <User/>
              </el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon>
                <SwitchButton/>
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-menu>

    <!-- 登录注册弹窗 -->
    <el-dialog
        v-model="loginDialogVisible"
        title=""
        width="450px"
        :show-close="true"
        :destroy-on-close="true"
        class="login-dialog"
    >
      <LoginRegister
          ref="loginRegisterRef"
          @login-success="handleLoginSuccess"
          @register-success="handleRegisterSuccess"
      />
    </el-dialog>
  </el-header>
</template>

<script setup>
import {ref, computed, onMounted, reactive} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  Avatar,
  User,
  Star,
  Clock,
  ArrowDown,
  SwitchButton,
  VideoCamera,
  Search
} from '@element-plus/icons-vue'
import {ElMessageBox, ElMessage} from 'element-plus'
import LoginRegister from './LoginRegister.vue'
import {useUserStore} from '../store/user'
import {getCurrentUser} from "@/api/user.js";

const loginDialogVisible = ref(false)
const loginRegisterRef = ref(null)
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const searchKeyword = ref('')

// 计算当前激活的菜单项
const activeIndex = computed(() => {
  return route.path
})

// 点击Logo跳转到首页
const goToHome = () => {
  router.push('/')
}

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value.trim() }
  })
}

// 清空搜索框
const clearSearch = () => {
  searchKeyword.value = ''
}

// 接收从URL参数获取搜索关键词
const setSearchKeywordFromUrl = () => {
  if (route.path === '/search' && route.query.keyword) {
    searchKeyword.value = route.query.keyword
  }
}

// 打开登录对话框
const openLoginDialog = () => {
  loginDialogVisible.value = true
}

// 登录成功处理
const handleLoginSuccess = (user) => {
  loginDialogVisible.value = false
  // 登录成功后刷新用户信息
  fetchUserInfo()
}

// 注册成功处理
const handleRegisterSuccess = () => {
  // 注册成功后可以切换到登录选项卡
  if (loginRegisterRef.value) {
    loginRegisterRef.value.activeTab = 'login'
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'upload':
      router.push('/profile')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout().then(() => {
      router.push('/')
    })
  }).catch(() => {
  })
}
const userInfo = ref()
// 检查当前用户信息并更新
const fetchUserInfo = async () => {
  if (userStore.isLoggedIn) {
    try {
      const response = await getCurrentUser();
     userInfo.value = response.user
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
}

onMounted(() => {
  fetchUserInfo();
  setSearchKeywordFromUrl();
})
</script>

<style scoped>
.nav-menu {
  width: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  cursor: pointer;
  color: #606266;
  font-size: 16px;
  font-weight: 500;
}

.logo {
  height: 30px;
  margin-right: 10px;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.search-input {
  width: 100%;
}

.search-icon {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-container {
    max-width: 200px;
    margin: 0 10px;
  }
  
  .nav-menu {
    padding: 0 10px;
  }
  
  .logo-container {
    padding: 0 10px;
  }
  
  .username {
    display: none;
  }
}

.flex-grow {
  flex-grow: 1;
}

.user-auth-wrapper {
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.login-btn {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.login-text {
  margin-left: 5px;
}

.user-dropdown {
  padding: 0 20px;
  cursor: pointer;
}

.user-avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 5px 0 8px;
  font-size: 14px;
  color: #606266;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 8px;
}

:deep(.login-dialog .el-dialog__header) {
  padding: 0;
}

:deep(.login-dialog .el-dialog__body) {
  padding: 0;
}
</style>