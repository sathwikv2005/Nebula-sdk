import express, { type Router } from 'express'
import type { Connection } from 'mongoose'

import { Nebula as CoreNebula } from '@nebula-sdk/core'
import { MongooseAdapter } from '@nebula-sdk/mongoose'

import type { NebulaOptions } from './types/config.js'

export class Nebula {
	private readonly core: CoreNebula
	private readonly routerInstance: Router

	constructor(options: NebulaOptions) {
		const { database, ...config } = options

		const storage = new MongooseAdapter(database)

		this.core = new CoreNebula({
			...config,
			storage,
		})

		this.routerInstance = express.Router()
	}

	async initialize(): Promise<void> {
		await this.core.initialize()
	}

	router(): Router {
		return this.routerInstance
	}
}
