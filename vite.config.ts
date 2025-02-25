import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Define o caminho base para produção
  base: "/",

  // Plugins utilizados
  plugins: [react()],

  // Configurações de resolução de caminhos
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Usa "@" como atalho para o diretório src
    },
  },

  // Configurações de build
  build: {
    outDir: "dist", // Diretório de saída
    emptyOutDir: true, // Limpa o diretório antes do build
  },

  // Configuração do servidor de desenvolvimento
  server: {
    port: 3000, // Define a porta local
    open: true, // Abre o navegador automaticamente
  },

  // Configurações de preview
  preview: {
    port: 5000, // Porta para o preview do build
  },
});
