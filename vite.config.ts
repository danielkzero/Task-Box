/// <reference types="vitest" />

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

// Configuração padrão para Ionic + Vue + Capacitor
export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11'], // mantém compatibilidade moderna
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Servidor de desenvolvimento
  server: {
    host: true, // permite acesso via IP local (importante para testar em celular)
    port: 8100,
  },

  // Configuração de build
  build: {
    target: 'esnext', // ideal para apps móveis modernos
    outDir: 'dist',
  },

  // Configuração de testes (Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
