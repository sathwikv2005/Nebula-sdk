import express, { type Router } from 'express'
import { createConnection, type Connection } from 'mongoose'

import { Nebula as CoreNebula } from '@nebula-sdk/core'
import { MongooseAdapter } from '@nebula-sdk/mongoose'

import type { NebulaOptions } from './types/config.js'

export class Nebula {
	private readonly core: CoreNebula
	private readonly connection: Connection
	private readonly ownsConnection: boolean
	private readonly routerInstance: Router

	constructor(options: NebulaOptions) {
		const { connection, uri, mongooseOptions, ...config } = options

		this.ownsConnection = !connection

		this.connection = connection ?? createConnection(uri!, mongooseOptions)

		const storage = new MongooseAdapter(this.connection)

		this.core = new CoreNebula({
			...config,
			storage,
		})

		this.routerInstance = express.Router()
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
