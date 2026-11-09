import type { Connection, ConnectOptions } from 'mongoose'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

type CoreOptions = Omit<ConstructorParameters<typeof CoreNebula>[0], 'storage'>

export interface NebulaConnectionOptions {
	connection: Connection
	uri?: never
	mongooseOptions?: never
}

export interface NebulaUriOptions {
	uri: string
	connection?: never
	mongooseOptions?: ConnectOptions
}

export interface NebulaExpressOptions {
	adminAuth: RequestHandler
	errorHandler?: ErrorRequestHandler
}

export type NebulaOptions = CoreOptions &
	NebulaExpressOptions &
	(NebulaConnectionOptions | NebulaUriOptions)
