<template>
  <div class="m-wangEditor">
    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor class="editor-content'" style="height: 300px; overflow-y: hidden;" v-model="valueHtml" :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" />
  </div>
</template>
<script lang="ts" setup>
import { uploadFile } from "@/api/goods";
import { ElMessage } from "element-plus";
import { IToolbarConfig } from "@wangeditor/editor";
// 引入 wangEditor
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import {
  onBeforeUnmount,
  onMounted,
  watch,
  shallowRef,
  ref,
  computed,
} from "vue";
const tokenInfo = ref({
  AccessKeyId: "",
  AccessKeySecret: "",
  SecurityToken: "",
});
let editors = null;
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const editorConfig = {
  placeholder: "请输入内容...",
  MENU_CONF: {},
  colors: [
    "#000000",
    "#eeece0",
    "#1c487f",
    "#4d80bf",
    "#c24f4a",
    "#8baa4a",
    "#7b5ba1",
    "#46acc8",
    "#f9963b",
    "#ffffff",
    "#1d3e6b",
    "#5e87a4",
    "#a6ccf9",
    "#9a3b1b",
    "#59ba55",
    "#7061a1",
    "#4a9ab9",
    "#e8f1d4",
    "#c69c6d",
    "#a27ea8",
    "#8c6238",
    "#4a9ab9",
    "#e8f1d4",
    "#c69c6d",
    "#a27ea8",
    "#8c6238",
    "#6d5f5f",
    "#176F58",
  ],
};
editorConfig.MENU_CONF["uploadImage"] = {
  // 自定义上传
  async customUpload(file: File, insertFn) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      console.log("file", file);
      formData.append("file", file);
      uploadFile(formData).then((urlInfo) => {
        if (urlInfo.code == 200) {
          insertFn(urlInfo.data);
        }
      });
    });
  },
};
editorConfig.MENU_CONF["uploadVideo"] = {
  // 自定义上传
  async customUpload(file: File, insertFn) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      console.log("file", file);
      formData.append("file", file);
      uploadFile(formData).then((urlInfo) => {
        if (urlInfo.code == 200) {
          insertFn(urlInfo.data);
        }
      });
    });
  },
};
// 内容 HTML
const mode = ref("default");
let emit = defineEmits(["update:modelValue"]);
let props = defineProps({
  modelValue: String,
});

const getEditorData = () => {
  // 通过代码获取编辑器内容
  let data = editors.txt.html();
  alert(data);
};

const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

const valueHtml = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    // 防止富文本内容为空时，校验失败
    if (editorRef.value.isEmpty()) val = "";
    emit("update:modelValue", val);
  },
});

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  // 调用销毁 API 对当前编辑器实例进行销毁
  const editor = editorRef.value;
  if (editor == null) {
    return;
  }
  editor.destroy();
});
</script>
<style lang="scss" scoped>
.m-wangEditor {
  z-index: 99;
  width: 100%;
  border: 1px solid #cccccc;
  .editor-toolbar {
    border-bottom: 1px solid #cccccc;
  }
  .editor-content {
    overflow-y: hidden;
  }
}
</style>
