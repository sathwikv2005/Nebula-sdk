import express, { type Router } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'
import type { ErrorRequestHandler, RequestHandler } from 'express'

import { createApplicationRouter } from './applications.js'

export function createNebulaRouter(
	core: CoreNebula,
	adminAuth: RequestHandler,
	errorHandler?: ErrorRequestHandler,
): Router {
	const router = express.Router()

	router.use(express.json())

	router.use('/applications', adminAuth, createApplicationRouter(core))

	if (errorHandler) {
		router.use(errorHandler)
	}

	return router
}
