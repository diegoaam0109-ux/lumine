import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`          -> sitio normal para Vercel (dist/)
// `npm run build:artefacto` -> un solo HTML autocontenido para publicar como artefacto (dist-artefacto/)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'artefacto' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: mode === 'artefacto' ? { outDir: 'dist-artefacto', assetsInlineLimit: 100_000_000 } : {},
}))
