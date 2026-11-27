import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [
		react(),
		{
			name: 'nebula-dev-config',
			transformIndexHtml() {
				return [
					{
						tag: 'script',
						injectTo: 'head',
						children: `
							window.__NEBULA_CONFIG__ = {
								apiRoute: '/_nebula',
								title: 'Nebula Dashboard',
								basePath: '/_nebula/dashboard'
							}
						`,
					},
				]
			},
		},
	],
	build: {
		outDir: 'dist/client',
		emptyOutDir: true,
	},
	base: './',
	server: {
		proxy: {
			'/_nebula': {
				target: 'http://localhost:9001',
				changeOrigin: true,
				bypass(req) {
					if (req.url?.startsWith('/_nebula/dashboard')) {
						return req.url
					}
				},
			},
		},
	},
})
