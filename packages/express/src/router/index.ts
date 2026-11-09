import express, { type Router } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'
import type { RequestHandler } from 'express'

import { createApplicationRouter } from './applications.js'

export function createNebulaRouter(core: CoreNebula): Router {
	const router = express.Router()

	router.use(express.json())

	//TODO: Administrative routes
	router.use('/applications', createApplicationRouter(core))

	return router
}
