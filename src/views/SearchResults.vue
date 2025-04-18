<template>
  <div class="search-results">
    <el-container>
      <el-main>
        <div class="search-header">
          <h2 class="page-title">搜索结果: "{{ keyword }}"</h2>
          <div class="search-info">
            共找到 {{ totalResults }} 个结果
          </div>
        </div>
        
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="searchResults.length === 0" class="no-results">
          <el-empty :description="`未找到与'${keyword}'相关的视频`">
            <template #extra>
              <el-button @click="goToHome">返回首页</el-button>
            </template>
          </el-empty>
        </div>
        
        <el-row v-else :gutter="20">
          <el-col :span="6" v-for="video in searchResults" :key="video.id">
            <el-card class="video-card" shadow="hover" @click="goToVideo(video.id)">
              <div class="video-thumbnail">
                <el-image
                  :src="video.coverUrl || 'https://via.placeholder.com/320x180'"
                  fit="cover"
                />
              </div>
              <div class="video-info">
                <h3>{{ video.title }}</h3>
                <p class="uploader">{{ video.uploaderName }}</p>
                <p class="video-stats">
                  <span>{{ formatNumber(video.views) }} 播放</span>
                  <span class="dot">·</span>
                  <span>{{ formatNumber(video.likes) }} 赞</span>
                  <span class="dot">·</span>
                  <span class="video-category">{{ formatCategory(video.category) }}</span>
                </p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="pagination-container" v-if="totalResults > 0">
          <el-pagination
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next"
            :total="totalResults">
          </el-pagination>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { searchVideos } from '@/api/video'
import { formatNumber, formatCategory } from '@/utils/videoUtils'

const route = useRoute()
const router = useRouter()
const keyword = ref('')
const searchResults = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const totalResults = ref(0)

// 加载搜索结果
const loadSearchResults = async () => {
  if (!keyword.value) {
    searchResults.value = []
    totalResults.value = 0
    return
  }
  
  try {
    loading.value = true
    const response = await searchVideos(keyword.value, currentPage.value, pageSize.value)
    
    if (response.success) {
      searchResults.value = response.data.videos || []
      totalResults.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '搜索失败')
    }
  } catch (error) {
    console.error('搜索视频失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadSearchResults()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转到视频详情页
const goToVideo = (videoId) => {
  router.push({ path: `/video/${videoId}` })
}

// 返回首页
const goToHome = () => {
  router.push('/')
}

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    keyword.value = newKeyword || ''
    currentPage.value = 1
    loadSearchResults()
  },
  { immediate: true }
)
</script>

<style scoped>
.search-results {
  min-height: 100vh;
}

.search-header {
  margin-bottom: 20px;
}

.page-title {
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 500;
}

.search-info {
  color: #606266;
  font-size: 14px;
}

.loading-container {
  padding: 20px;
}

.no-results {
  padding: 100px 0;
  text-align: center;
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
  height: 0;
  padding-bottom: 56.25%;  /* 16:9 宽高比 */
  position: relative;
  overflow: hidden;
}

.video-thumbnail .el-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 48px;
}

.uploader {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}

.video-stats {
  margin: 5px 0 0;
  font-size: 12px;
  color: #999;
}

.dot {
  margin: 0 5px;
}

.video-category {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #606266;
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style> 