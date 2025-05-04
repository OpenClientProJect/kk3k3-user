<template>
  <div class="home">
    <el-container>
      <el-main>
        <h2 class="page-title">最新视频</h2>
            <el-row :gutter="20">
              <el-col :span="8" v-for="video in latestVideos" :key="video.id">
                <el-card class="video-card" shadow="hover" @click="goToVideo(video.id)">
                  <div class="video-thumbnail">
                    <el-image
                      :src="video.coverUrl "
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
            
            <div class="pagination-container" v-if="latestTotal > 0">
              <el-pagination
                @current-change="handleLatestPageChange"
                :current-page="latestPage"
                :page-size="pageSize"
                layout="prev, pager, next"
                :total="latestTotal">
              </el-pagination>
            </div>
            
            <div class="no-data" v-if="latestVideos.length === 0">
              <el-empty description="暂无视频数据"></el-empty>
            </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getLatestVideos } from '../api/video'
import { formatNumber, formatCategory } from '../utils/videoUtils'

const router = useRouter()
const latestVideos = ref([])
const latestTotal = ref(0)
const latestPage = ref(1)
const pageSize = ref(9)

// 加载最新视频数据
const loadLatestVideos = async (page = 1) => {
  try {
    latestPage.value = page
    const response = await getLatestVideos()
    
    if (response.success) {
      latestVideos.value = response.data.videos
      latestTotal.value = response.data.total
    } else {
      ElMessage.error(response.message || '获取最新视频列表失败')
    }
  } catch (error) {
    console.error('加载最新视频失败:', error)
    ElMessage.error('获取最新视频列表失败，请稍后重试')
  }
}


// 处理最新视频分页变化
const handleLatestPageChange = (page) => {
  loadLatestVideos(page)
}

// 跳转到视频详情页
const goToVideo = (videoId) => {
  router.push({ path: `/video/${videoId}` })
}

// 组件挂载时加载视频
onMounted(() => {
  loadLatestVideos()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.page-title {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 600;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.no-data {
  margin-top: 50px;
  text-align: center;
}


.popular-title .el-icon {
  margin-right: 8px;
  color: #ff9900;
  font-size: 22px;
}


.popular-item:last-child {
  border-bottom: none;
}

.popular-item:hover {
  background-color: #f0f0f0;
  transform: translateX(5px);
}

.popular-info h4 {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  transition: color 0.2s;
}

.popular-item:hover .popular-info h4 {
  color: #409EFF;
}

.popular-stats:before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  background-color: #ddd;
  border-radius: 50%;
  margin-right: 5px;
}

.video-category {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #606266;
  font-size: 12px;
}
</style>