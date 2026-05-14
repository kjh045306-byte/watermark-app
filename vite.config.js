import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',

      // public/ 에서 캐시에 포함할 추가 파일
      includeAssets: [
        'favicon.ico',
        'pwa-icon.svg',
        'apple-touch-icon-180x180.png',
      ],

      manifest: {
        name: '워터마크',
        short_name: '워터마크',
        description: 'PDF에 워터마크를 추가하고 다운로드합니다',
        lang: 'ko',
        theme_color: '#863bff',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png',             sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',            sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',            sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png',  sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      workbox: {
        // 빌드 산출물 중 사전 캐시할 파일 패턴
        // mjs: Vite가 ?url 로 포함시킨 pdf.worker 등 ES 모듈 자산 포함
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,ico,woff,woff2}'],

        // pdfjs 워커(~1.2 MB) 등 큰 파일도 캐시 허용 (기본 2 MB → 3 MB)
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,

        // 오래된 캐시 자동 정리
        cleanupOutdatedCaches: true,
      },

      // 개발 서버에서는 SW 비활성화 (HMR 간섭 방지)
      devOptions: { enabled: false },
    }),
  ],
})
