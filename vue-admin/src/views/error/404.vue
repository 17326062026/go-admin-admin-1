<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-desc">抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面不需要特殊逻辑
</script>

<style lang="scss" scoped>
.error-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.error-content {
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  color: #409EFF;
  margin: 0;
  line-height: 1.2;
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin: 20px 0;
}

.error-desc {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}
</style>