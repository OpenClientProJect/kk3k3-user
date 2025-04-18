<template>
  <div class="login-register">
    <el-tabs v-model="activeTab" class="login-tabs">
      <el-tab-pane label="登录" name="login">
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="form-container">
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="用户名" 
              class="custom-input"
              size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="密码"
              class="custom-input"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <div class="remember-forgot">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          </div>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleLogin" 
              :loading="userStore.loading" 
              class="submit-button"
              size="large"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="注册" name="register">
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" class="form-container">
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username" 
              placeholder="用户名" 
              class="custom-input"
              size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="密码"
              class="custom-input"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="确认密码"
              class="custom-input"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input 
              v-model="registerForm.nickname" 
              placeholder="昵称" 
              class="custom-input"
              size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="email">
            <el-input 
              v-model="registerForm.email" 
              placeholder="邮箱" 
              class="custom-input"
              size="large"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleRegister" 
              :loading="userStore.loading" 
              class="submit-button"
              size="large"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const activeTab = ref('login')
const rememberMe = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 获取用户状态管理
const userStore = useUserStore()

// 发送事件
const emit = defineEmits(['login-success', 'register-success'])

// 登录表单数据和验证规则
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 注册表单数据和验证规则
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  avatarUrl: 'https://via.placeholder.com/150' // 默认头像
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickname: [
    { required: false, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ]
}

// 登录处理函数
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate(async (valid) => {
      if (valid) {
        const result = await userStore.login(loginForm)
        
        if (result.success) {
          // 通知父组件登录成功
          emit('login-success', result.user)
        }
      }
    })
  } catch (error) {
    console.error('表单验证错误:', error)
  }
}

// 注册处理函数
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate(async (valid) => {
      if (valid) {
        // 准备注册数据（移除确认密码字段）
        const registerData = {
          username: registerForm.username,
          password: registerForm.password,
          nickname: registerForm.nickname || registerForm.username, // 如果未提供昵称，使用用户名
          email: registerForm.email,
          avatarUrl: registerForm.avatarUrl
        }
        
        const result = await userStore.register(registerData)
        
        if (result.success) {
          // 清空表单
          registerFormRef.value.resetFields()
          
          // 切换到登录选项卡
          activeTab.value = 'login'
          
          // 预填登录表单
          loginForm.username = registerData.username
          
          // 通知父组件注册成功
          emit('register-success')
        }
      }
    })
  } catch (error) {
    console.error('表单验证错误:', error)
  }
}

defineExpose({
  activeTab
})
</script>

<style scoped>
.login-register {
  padding: 20px;
  width: 380px;
  color: #333;
}

.header-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.welcome-text {
  font-size: 1.5rem;
  color: #409EFF;
  margin: 5px 0 15px;
  font-weight: 500;
}

.login-tabs {
  margin-bottom: 15px;
}

.form-container {
  margin-top: 15px;
}

.custom-input {
  margin-bottom: 5px;
  border-radius: 8px;
}

.submit-button {
  width: 100%;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 10px;
  height: 44px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.forgot-link {
  color: #409EFF;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.other-login {
  margin-top: 20px;
}

.divider {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 14px;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #EBEEF5;
}

.divider::before {
  margin-right: 10px;
}

.divider::after {
  margin-left: 10px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}

.social-icon {
  font-size: 18px;
  color: #606266;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 15px 15px;
}

:deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}

:deep(.el-tabs__active-bar) {
  width: 50% !important;
  transform: translateX(0);
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
</style> 