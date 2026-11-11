import { defineConfig } from 'vite'
import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineConfig({
    base: '/',
    server: {
        headers: {
            'Permissions-Policy': 'unload=self'
        }
    },
    plugins: [
        {
            name: 'github-pages-spa-fallback',
            async writeBundle(outputOptions) {
                const outputDir = resolve(outputOptions.dir || 'dist')
                await copyFile(
                    resolve(outputDir, 'index.html'),
                    resolve(outputDir, '404.html')
                )
            }
        }
    ]
})
