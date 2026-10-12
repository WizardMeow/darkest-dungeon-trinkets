import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: { title: '地牢档案 · 饰品' },
  output: { assetPrefix: './' },
  server: { host: '127.0.0.1', port: 3000, strictPort: false },
});
