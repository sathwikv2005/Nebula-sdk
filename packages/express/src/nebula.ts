import express, { type Router } from 'express'
import { createConnection, type Connection } from 'mongoose'

import { Nebula as CoreNebula } from '@nebula-sdk/core'
import { MongooseAdapter } from '@nebula-sdk/mongoose'

import type { NebulaOptions } from './types/config.js'
import { createNebulaRouter } from './router/index.js'

export class Nebula {
	private readonly core: CoreNebula
	private readonly connection: Connection
	private readonly ownsConnection: boolean
	private readonly routerInstance: Router

	constructor(options: NebulaOptions) {
		const {
			connection,
			uri,
			mongooseOptions,
			adminAuth,
			errorHandler,
			enableDeviceAuthOnAllRoutes,
			...config
		} = options

		if (!connection && !uri) {
			throw new Error('Either a MongoDB connection or URI must be provided.')
		}

		this.ownsConnection = !connection

		this.connection = connection ?? createConnection(uri!, mongooseOptions)

		const storage = new MongooseAdapter(this.connection)

		this.core = new CoreNebula({
			...config,
			storage,
		})

		this.routerInstance = createNebulaRouter(
			this.core,
			adminAuth,
			errorHandler,
			enableDeviceAuthOnAllRoutes,
		)
	}

	async initialize(): Promise<void> {
		if (this.ownsConnection) {
			await this.connection.asPromise()
		}

		await this.core.initialize()
	}

	async close(): Promise<void> {
		if (this.ownsConnection) {
			await this.connection.close()
		}
	}

	router(): Router {
		return this.routerInstance
	}
}
