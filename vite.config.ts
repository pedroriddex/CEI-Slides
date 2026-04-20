import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {resolve} from 'node:path';

export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: resolve(__dirname, '../static'),
  server: {
    host: 'localhost',
    port: 4174
  }
});
