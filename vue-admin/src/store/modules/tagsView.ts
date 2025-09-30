import { defineStore } from 'pinia'
import { RouteLocationNormalizedLoaded } from 'vue-router'

interface TagsViewState {
  visitedViews: RouteLocationNormalizedLoaded[]
  cachedViews: string[]
}

export const useTagsViewStore = defineStore('tagsView', {
  state: (): TagsViewState => ({
    visitedViews: [],
    cachedViews: []
  }),
  actions: {
    addVisitedView(view: RouteLocationNormalizedLoaded) {
      // 检查是否已存在相同路径的标签
      const existingIndex = this.visitedViews.findIndex(v => v.path === view.path)
      //处理2个首页的问题
      if(view.fullPath && view.fullPath.includes('dashboard')){
        const existingIndex = this.visitedViews.findIndex(v => v.path.includes(view.path)) 
        if (existingIndex !== -1) {
          return
        }
      }
      if (existingIndex !== -1) {
        // 如果存在，直接返回，不添加重复的标签
        return
      }
      
      // 只添加有标题的路由
      if (!view.meta?.title) return
      
      this.visitedViews.push(
        Object.assign({}, view, {
          title: view.meta?.title || 'no-name'
        })
      )
    },
    
    addCachedView(view: RouteLocationNormalizedLoaded) {
      if (this.cachedViews.includes(view.name as string)) return
      if (!view.meta?.noCache && view.name) {
        this.cachedViews.push(view.name as string)
      }
    },
    
    delVisitedView(view: RouteLocationNormalizedLoaded) {
      for (const [i, v] of this.visitedViews.entries()) {
        if (v.path === view.path) {
          this.visitedViews.splice(i, 1)
          break
        }
      }
    },
    
    delCachedView(view: RouteLocationNormalizedLoaded) {
      if (!view.name) return
      const index = this.cachedViews.indexOf(view.name as string)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    },
    
    delOthersViews(view: RouteLocationNormalizedLoaded) {
      this.visitedViews = this.visitedViews.filter(v => {
        return v.meta?.affix || (v.path === view.path)
      })
      
      if (!view.name) return
      const index = this.cachedViews.indexOf(view.name as string)
      if (index > -1) {
        this.cachedViews = this.cachedViews.slice(index, index + 1)
      } else {
        this.cachedViews = []
      }
    },
    
    delAllViews() {
      // 保留固定的标签
      this.visitedViews = this.visitedViews.filter(tag => tag.meta?.affix)
      this.cachedViews = []
    },
    
    updateVisitedView(view: RouteLocationNormalizedLoaded) {
      for (let i = 0; i < this.visitedViews.length; i++) {
        if (this.visitedViews[i].path === view.path) {
          // 使用新的视图对象替换旧的，但保留原始索引位置
          this.visitedViews[i] = Object.assign({}, this.visitedViews[i], view)
          break
        }
      }
    }
  }
})