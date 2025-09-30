<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <div class="tags-view-scroll">
        <el-scrollbar class="tags-scrollbar">
          <div class="tags-view-item-wrapper">
            <span v-for="tag in filteredVisitedViews" :key="tag.path" :class="isActive(tag) ? 'active-tag' : 'tag'" @click="handleClick(tag)" @contextmenu.prevent="openMenu($event, tag)">
              <el-icon v-if="tag.meta && tag.meta.icon" class="tag-icon">
                <component :is="tag.meta.icon" />
              </el-icon>
              {{ tag.meta.title }}
              <el-icon class="tag-close" v-if="!isAffix(tag)" @click.stop="closeTag(tag)">
                <Close />
              </el-icon>
            </span>
          </div>
        </el-scrollbar>
      </div>

      <div class="tags-view-actions">
        <el-dropdown @command="handleCommand">
          <el-button type="primary" size="small" plain>
            操作
            <el-icon class="el-icon--right">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
              <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
              <el-dropdown-item command="refreshCurrent">刷新当前页</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-show="visible" :style="{left: left+'px', top: top+'px'}" class="contextmenu">
      <div class="contextmenu-item" @click="refreshSelectedTag(selectedTag)">刷新</div>
      <div class="contextmenu-item" v-if="selectedTag && !isAffix(selectedTag)" @click="closeTag(selectedTag)">关闭</div>
      <div class="contextmenu-item" @click="closeOthersTags">关闭其他</div>
      <div class="contextmenu-item" @click="closeAllTags">关闭所有</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTagsViewStore } from "@/store/modules/tagsView";
import { Close, ArrowDown } from "@element-plus/icons-vue";
import { RouteLocationNormalizedLoaded } from "vue-router";

const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();

// 右键菜单相关
const visible = ref(false);
const top = ref(0);
const left = ref(0);
const selectedTag = ref<RouteLocationNormalizedLoaded | null>(null);

// 获取已访问的视图
const visitedViews = computed(() => tagsViewStore.visitedViews);

// 过滤掉重复的标签（基于路径）
const filteredVisitedViews = computed(() => {
  const uniquePaths = new Map<string, RouteLocationNormalizedLoaded>();

  // 遍历所有标签，只保留每个路径的最后一个标签
  visitedViews.value.forEach((tag) => {
    uniquePaths.set(tag.path, tag);
  });
  // 将Map转换回数组
  return Array.from(uniquePaths.values());
});

// 判断是否是当前激活的路由
const isActive = (tag: RouteLocationNormalizedLoaded) => {
  return tag.path === route.path;
};

// 判断是否是固定标签
const isAffix = (tag: RouteLocationNormalizedLoaded) => {
  return tag?.meta && tag.meta.affix;
};

// 初始化标签
const initTags = () => {
  // 先清空所有标签，避免重复
  tagsViewStore.delAllViews();

  // 添加固定标签
  const affixTags = filterAffixTags(router.getRoutes());
  for (const tag of affixTags) {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  }

  // 添加当前路由
  addTags();
};

// 过滤固定标签
const filterAffixTags = (routes: any[]) => {
  const tags: RouteLocationNormalizedLoaded[] = [];
  const addTags = (routes: any[]) => {
    routes.forEach((route) => {
      if (route.meta && route.meta.affix) {
        const tag = {
          fullPath: route.path,
          path: route.path,
          name: route.name,
          meta: { ...route.meta },
        } as RouteLocationNormalizedLoaded;

        // 检查是否已经添加过相同路径的标签
        if (!tags.some((t) => t.path === tag.path)) {
          tags.push(tag);
        }
      }

      if (route.children) {
        addTags(route.children);
      }
    });
  };

  addTags(routes);
  return tags;
};

// 添加当前路由到标签
const addTags = () => {
  const { name, path } = route;
  if (name) {
    // 检查是否已经存在相同路径的标签
    const existingTag = tagsViewStore.visitedViews.find((v) => v.path === path);
    if (!existingTag) {
      tagsViewStore.addVisitedView(route);
      tagsViewStore.addCachedView(route);
    }
  }
};

// 处理标签点击
const handleClick = (tag: RouteLocationNormalizedLoaded) => {
  if (tag.path === route.path) return;
  router.push(tag.path);
};

// 关闭标签
const closeTag = async (tag: RouteLocationNormalizedLoaded) => {
  if (!tag) return;
  await tagsViewStore.delVisitedView(tag);
  await tagsViewStore.delCachedView(tag);
  if (isActive(tag)) {
    toLastView();
  }
  visible.value = false;
};

// 跳转到最后一个标签
const toLastView = () => {
  const latestView = filteredVisitedViews.value.slice(-1)[0];
  if (latestView) {
    router.push(latestView.path);
  } else {
    router.push("/");
  }
};

// 刷新选中的标签
const refreshSelectedTag = async (
  tag: RouteLocationNormalizedLoaded | null
) => {
  if (!tag) return;
  visible.value = false;

  await tagsViewStore.delCachedView(tag);
  const { fullPath } = tag;
  nextTick(() => {
    router.replace({
      path: "/redirect" + fullPath,
    });
  });
};

// 关闭其他标签
const closeOthersTags = async () => {
  if (selectedTag.value) {
    await tagsViewStore.delOthersViews(selectedTag.value);
    if (!isActive(selectedTag.value)) {
      router.push(selectedTag.value.path);
    }
  }
  visible.value = false;
};

// 关闭所有标签
const closeAllTags = async () => {
  await tagsViewStore.delAllViews();
  router.push("/");
  visible.value = false;
};

// 打开右键菜单
const openMenu = (e: MouseEvent, tag: RouteLocationNormalizedLoaded) => {
  const menuMinWidth = 105;
  const offsetLeft = e.clientX;
  const offsetWidth = document.body.offsetWidth;
  const maxLeft = offsetWidth - menuMinWidth;
  left.value = offsetLeft > maxLeft ? maxLeft : offsetLeft;
  top.value = e.clientY;

  visible.value = true;
  selectedTag.value = tag;
};

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case "closeOthers":
      closeOthersTags();
      break;
    case "closeAll":
      closeAllTags();
      break;
    case "refreshCurrent":
      refreshSelectedTag(route);
      break;
  }
};

// 点击页面其他地方关闭右键菜单
const closeMenu = () => {
  visible.value = false;
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    addTags();
  }
);

onMounted(() => {
  initTags();
  document.addEventListener("click", closeMenu);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenu);
});
</script>

<style lang="scss" scoped>
.tags-view-container {
  width: 100%;
  height: 34px; /* 减小高度 */
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  position: relative;

  .tags-view-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;

    .tags-view-scroll {
      flex: 1;
      overflow: hidden;

      .tags-scrollbar {
        white-space: nowrap;
        height: 34px; /* 减小高度 */
        width: 100%;

        .tags-view-item-wrapper {
          padding: 0 10px;
          display: inline-flex; /* 改为 flex 布局 */
          align-items: center; /* 垂直居中 */
          height: 34px; /* 减小高度 */
        }
      }
    }

    .tags-view-actions {
      padding-right: 15px;
    }
  }

  .tag,
  .active-tag {
    display: inline-flex;
    align-items: center;
    margin-right: 5px;
    padding: 0 8px;
    height: 26px; /* 减小高度 */
    line-height: 26px; /* 减小行高 */
    border: 1px solid #d8dce5;
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;

    .tag-icon {
      margin-right: 4px;
      font-size: 14px;
    }

    .tag-close {
      margin-left: 4px;
      border-radius: 50%;
      text-align: center;
      transition: all 0.3s;
      font-size: 12px;

      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }

  .tag {
    color: #495060;
    background: #fff;

    &:first-of-type {
      margin-left: 5px;
    }

    &:hover {
      color: #409eff;
      border-color: #409eff;
    }
  }

  .active-tag {
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;

    &::before {
      content: "";
      background: #fff;
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      position: relative;
      margin-right: 6px;
    }
  }

  .contextmenu {
    position: fixed;
    background: #fff;
    z-index: 3000;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .contextmenu-item {
      cursor: pointer;
      font-size: 14px;
      padding: 8px 16px;

      &:hover {
        background: #eee;
      }
    }
  }
}
</style>