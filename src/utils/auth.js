// 保存用户信息到localStorage
export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

// 获取用户信息
export function getUser() {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// 清除用户信息
export function removeUser() {
  localStorage.removeItem('user')
}

// 保存token
export function setToken(token) {
  localStorage.setItem('token', token)
}

// 获取token
export function getToken() {
  return localStorage.getItem('token')
}

// 清除token
export function removeToken() {
  localStorage.removeItem('token')
}

// 判断是否登录
export function isLoggedIn() {
  return !!getUser()
}

// 登出
export function logout() {
  removeUser()
  removeToken()
} 