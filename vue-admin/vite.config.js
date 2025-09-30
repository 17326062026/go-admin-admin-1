import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@views': path.resolve(__dirname, './src/views'),
            '@components': path.resolve(__dirname, './src/components'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@api': path.resolve(__dirname, './src/api'),
            '@store': path.resolve(__dirname, './src/store')
        }
    },
    server: {
        // 开发服务器配置
        port: 3000,
        // 启用 HMR
        hmr: true,
        // 启用 CORS
        cors: true,
        // 配置代理
        proxy: {
            '/api': {
                target: 'https://api.liqinglin.cn',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ''); },
                cookieDomainRewrite: 'localhost',
                secure: false // 如果是https需要验证证书则设为true
                // secure: false,
                // timeout: 30000, // 增加超时时间到30秒
                // configure: (proxy, _options) => {
                //   proxy.on('error', (err, _req, _res) => {
                //     console.log('proxy error', err);
                //   });
                //   proxy.on('proxyReq', (proxyReq, req, _res) => {
                //     console.log('Sending Request:', req.method, req.url);
                //   });
                //   proxy.on('proxyRes', (proxyRes, req, _res) => {
                //     console.log('Received Response from:', req.url, proxyRes.statusCode);
                //   });
                // }
            }
        }
    },
    build: {
        // 添加时间戳作为查询参数，破坏缓存
        rollupOptions: {
            output: {
                // 为所有静态资源文件名添加内容哈希
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]'
            }
        },
        // 启用源码映射，便于调试
        sourcemap: false,
        // 启用 CSS 代码分割
        cssCodeSplit: true
    },
    // 确保正确处理静态资源
    publicDir: 'public',
    base: '/'
});
