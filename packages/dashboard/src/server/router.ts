import express, { type Router } from 'express'
import path from 'node:path'
import fs from 'node:fs'

import type { DashboardOptions } from './types.js'

const CLIENT_PATH = path.resolve(__dirname, '../client')

const defaultDashboardOptions: Required<DashboardOptions> = {
	apiRoute: '/_nebula/admin',
	title: 'Nebula Admin Dashboard',
}

export function createDashboardRouter(options: DashboardOptions = {}): Router {
	const router = express.Router()

	const apiRoute = options.apiRoute ?? defaultDashboardOptions.apiRoute
	const title = options.title ?? defaultDashboardOptions.title

	if (!apiRoute.startsWith('/') || apiRoute.startsWith('//')) {
		throw new Error(`apiRoute must be a root-relative path like '/_nebula/admin'`)
	}

	const htmlPath = path.join(CLIENT_PATH, 'index.html')
	const html = fs.readFileSync(htmlPath, 'utf-8')

	router.use(
		express.static(CLIENT_PATH, {
			index: false,
		}),
	)

	router.get(/.*/, (req, res) => {
		const config = JSON.stringify({
			apiRoute,
			title,
			basePath: req.baseUrl,
		})
			.replace(/</g, '\\u003c')
			.replace(/>/g, '\\u003e')
			.replace(/&/g, '\\u0026')

		const configuredHtml = html.replace(
			'</head>',
			`<script>window.__NEBULA_CONFIG__ = ${config}</script></head>`,
		)

		res.type('html').send(configuredHtml)
	})

	return router
}
