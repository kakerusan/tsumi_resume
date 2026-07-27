import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
function localResumePlugin() {
  return {
    name: 'local-resume-loader',
    configureServer(server) {
      server.middlewares.use('/__local_resume__', async (request, response) => {
        try {
          const url = new URL(request.url || '/', 'http://localhost')
          const filePath = url.searchParams.get('path')
          if (!filePath) {
            response.statusCode = 400
            response.end('Missing path')
            return
          }

          const content = await readFile(resolve(filePath), 'utf8')
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(content)
        } catch (error) {
          console.error('Load local resume failed:', error)
          response.statusCode = 404
          response.end('Resume not found')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), localResumePlugin()],
})
