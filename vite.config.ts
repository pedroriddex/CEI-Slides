import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: 'public',
  server: {
    host: 'localhost',
    port: 4174
  }
});
