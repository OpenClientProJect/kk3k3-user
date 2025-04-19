import {defineStore} from "pinia";
import {ref, computed} from "vue";
import axios from "axios";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from "../api/user";
import {ElMessage} from "element-plus";

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const token = ref('');
  const loading = ref(false);

  // 计算属性
  const isLoggedIn = computed(() => !!user.value && !!token.value);
  const avatar = computed(() => {
    if (!user.value) return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
    
    // 获取头像URL
    let avatarUrl = user.value.avatarUrl;
    
    // 检查头像URL是否存在
    if (!avatarUrl) {
      return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
    }
    
    // 检查URL是否是相对路径，如果是，添加baseURL
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
      avatarUrl = `http://localhost:8080${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    }
    
    return avatarUrl;
  });
  const nickname = computed(() => user.value?.nickname || user.value?.username || '');
  const username = computed(() => user.value?.username || '');

  // 从localStorage中恢复用户信息和令牌
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch (e) {
      console.error('Failed to parse stored user info:', e);
      localStorage.removeItem('user');
    }
  }
  if (storedToken) {
    token.value = storedToken;
    // 设置axios默认请求头
    axios.defaults.headers.common['Authorization'] = storedToken;
  }

  // 登录
  async function login(loginData) {
    try {
      loading.value = true;
      const response = await loginApi(loginData);

      if (response.success) {
        // 保存token
        const tokenValue = response.token;
        token.value = tokenValue;
        localStorage.setItem('token', tokenValue);

        // 设置axios默认请求头
        axios.defaults.headers.common['Authorization'] = tokenValue;
        console.log('登录成功，已设置认证Token:', tokenValue.substring(0, 15) + '...');

        // 保存用户信息
        user.value = response.user;
        localStorage.setItem('user', JSON.stringify(response.user));

        ElMessage.success(`欢迎回来，${response.user.nickname || response.user.username}！`);
        return {success: true, user: response.user};
      } else {
        ElMessage.error(response.message || '登录失败');
        return {success: false, message: response.message};
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试');
      return {success: false, message: error.response?.data?.message || '登录失败，请稍后重试'};
    } finally {
      loading.value = false;
    }
  }

  // 注册
  async function register(registerData) {
    try {
      loading.value = true;
      const response = await registerApi(registerData);

      if (response.success) {
        ElMessage.success('注册成功，请登录');
        return {success: true};
      } else {
        ElMessage.error(response.message || '注册失败');
        return {success: false, message: response.message};
      }
    } catch (error) {
      console.error('注册失败:', error);
      ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试');
      return {success: false, message: error.response?.data?.message || '注册失败，请稍后重试'};
    } finally {
      loading.value = false;
    }
  }

  // 登出
  async function logout() {
    try {
      loading.value = true;

      // 调用后端登出接口
      if (token.value) {
        await logoutApi();
      }

      // 清除本地存储和状态
      user.value = null;
      token.value = '';
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // 清除axios默认请求头
      delete axios.defaults.headers.common['Authorization'];

      ElMessage.success('已退出登录');
      return {success: true, message: '登出成功'};
    } catch (error) {
      console.error('登出失败:', error);

      // 即使请求失败，也应清除本地状态
      user.value = null;
      token.value = '';
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];

      ElMessage.error(error.response?.data?.message || '登出失败，请稍后重试');
      return {success: false, message: error.response?.data?.message || '登出失败，请稍后重试'};
    } finally {
      loading.value = false;
    }
  }

  // 更新用户信息
  function updateUserInfo(userData) {
    if (userData && user.value) {
      // 合并现有用户信息和新信息
      user.value = { ...user.value, ...userData };
      // 更新localStorage
      localStorage.setItem('user', JSON.stringify(user.value));
    } else if (userData) {
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    avatar,
    nickname,
    username,
    login,
    register,
    logout,
    updateUserInfo
  };
});
