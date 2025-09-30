<template>
  <div class="hierarchy-container" ref="container">
    <div ref="chartContainer" class="hierarchy-chart"></div>
    <div class="controls">
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
      <button @click="resetZoom">重置</button>
    </div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <div class="tips-text">
      为减少服务器压力,仅展示5级
    </div>
  </div>
</template>
  
  <script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import * as d3 from "d3";
import { useElementSize } from "@vueuse/core";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    validator: (value) => value && value.name,
  },
  nodeWidth: {
    type: Number,
    default: 180,
  },
  nodeHeight: {
    type: Number,
    default: 80,
  },
  nodeSpacing: {
    type: Number,
    default: 100,
  },
  levelSpacing: {
    type: Number,
    default: 120,
  },
  duration: {
    type: Number,
    default: 800,
  },
});

const container = ref(null);
const chartContainer = ref(null);
const { width, height } = useElementSize(chartContainer);
const loading = ref(true);

let svg, g, zoom, tree;

// 初始化图表
const initChart = async () => {
  if (!chartContainer.value) {
    return;
  }
  loading.value = true;
  await nextTick();

  // 清除旧图表
  d3.select(chartContainer.value).selectAll("*").remove();

  // 创建SVG元素
  svg = d3
    .select(chartContainer.value)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("background-color", "#f9f9f9");

  // 添加缩放组
  g = svg.append("g");

  // 设置缩放行为
  zoom = d3
    .zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);
  tree = d3
    .tree()
    .nodeSize([
      props.nodeWidth + props.nodeSpacing,
      props.nodeHeight + props.levelSpacing,
    ])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

  updateChart();
};

// 更新图表
const updateChart = () => {
  if (!props.data) {
    loading.value = false;
    return;
  }

  // 转换数据为d3.hierarchy格式
  const root = d3.hierarchy(props.data);

  // 计算布局
  tree(root);

  // 计算边界框（包含所有节点）
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  root.descendants().forEach((node) => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  });

  // 添加边距
  const padding = 80;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  // 计算内容尺寸和容器尺寸
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const containerWidth = width.value;
  const containerHeight = height.value;

  // 计算最佳缩放比例（保持内容完全可见）
  const scale = Math.min(
    containerWidth / contentWidth,
    containerHeight / contentHeight,
    1.0 // 不超过原始大小
  );

  // 计算居中位置
  const translateX =
    (containerWidth - contentWidth * scale) / 2 - minX * scale || 600;
  const translateY =
    (containerHeight - contentHeight * scale) / 2 - minY * scale || 300;

  // 设置初始视图（带动画）
  console.log("translateX", translateX);
  console.log("translateY", translateY);
  if (containerWidth && containerHeight) {
    g.attr(
      "transform",
      `translate(${containerWidth / 2},${containerHeight / 2}) scale(0)`
    )
      .transition()
      .duration(props.duration)
      .attr(
        "transform",
        `translate(${translateX},${translateY}) scale(${scale})`
      )
      .on("end", () => (loading.value = false));
  }

  // 绘制连接线
  const links = g
    .selectAll(".link")
    .data(root.links())
    .join("path")
    .attr("class", "link")
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    )
    .attr("stroke", "#999")
    .attr("stroke-width", 2)
    .attr("fill", "none");

  // 绘制节点
  const nodes = g
    .selectAll(".node")
    .data(root.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  // 节点矩形
  nodes
    .append("rect")
    .attr("width", props.nodeWidth)
    .attr("height", props.nodeHeight)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("x", -props.nodeWidth / 2)
    .attr("y", -props.nodeHeight / 2)
    .attr("fill", (d) => (d.depth === 0 ? "#4a89dc" : "#656d78"))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  // 节点文本
  nodes
    .append("text")
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .text((d) => d.data.name);

  // 展开/折叠标记（非叶节点）
  nodes
    .filter((d) => d.children || d._children)
    .append("circle")
    .attr("r", 12)
    .attr("cx", props.nodeWidth / 2 - 20)
    .attr("cy", 0)
    .attr("fill", "#fff")
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .on("click", toggleChildren);

  nodes
    .filter((d) => d.children || d._children)
    .append("text")
    .attr("x", props.nodeWidth / 2 - 20)
    .attr("y", 5)
    .attr("text-anchor", "middle")
    .attr("fill", "#999")
    .text((d) => (d.children ? "-" : "+"))
    .on("click", toggleChildren);
  loading.value = false;
};

// 切换子节点展开/折叠
const toggleChildren = (event, d) => {
  event.stopPropagation(); // 阻止事件冒泡
  // 切换children和_children状态
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  // 更新树布局
  chartState.value.tree(chartState.value.root);
  // 重新绘制图表
  updateChart();
};

// 缩放控制
const zoomIn = () => {
  svg.transition().call(zoom.scaleBy, 1.2);
};

const zoomOut = () => {
  svg.transition().call(zoom.scaleBy, 0.8);
};

const resetZoom = () => {
  svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
};

// 监听数据和容器尺寸变化
watch(() => props.data, initChart, { deep: true });
watch([width, height], () => {
  console.log("watch-width", width);
  console.log("watch-height", height);
  if (!loading.value) updateChart();
});

// 初始化
onMounted(() => {
  setTimeout(() => {
    initChart();
  }, 0);
});
</script>
  
  <style scoped lang="scss">
.hierarchy-container {
  width: 100%;
  height: 80vh;
  min-height: 600px;
  position: relative;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.hierarchy-chart {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.controls button {
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.controls button:hover {
  background: #f0f0f0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.node text {
  font-size: 14px;
  pointer-events: none;
}

.link {
  transition: stroke-opacity 0.3s;
}
.tips-text {
  position: absolute;
  left: 10px;
  top: 10px;
  &:before {
    content: "*";
    color: red;
  }
}
</style>