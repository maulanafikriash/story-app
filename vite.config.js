import { defineConfig } from 'vite';
import workboxBuild from 'workbox-build';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    outDir: 'dist',
    assetsDir: 'assets',
  },
  plugins: [
    {
      name: 'inject-service-worker',
      apply: 'build',
      closeBundle() {
        const workboxOptions = {
          swSrc: 'public/service-worker.js',
          swDest: 'dist/service-worker.js',
          globDirectory: 'dist',
          globPatterns: ['**/*.{html,js,css,png,jpg,jpeg,svg,json,woff2}'],
        };

        workboxBuild.injectManifest(workboxOptions)
          .then(({ count, size }) => {
            console.log(`Service worker berhasil dibuat: ${count} file, total ${size} bytes.`);
          })
          .catch(err => {
            console.error('Error saat membuat service worker:', err);
          });
      },
    },
  ],
});
