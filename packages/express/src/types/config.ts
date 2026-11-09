import type { Connection, ConnectOptions } from 'mongoose'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

type CoreOptions = ConstructorParameters<typeof CoreNebula>[0]

type NebulaBaseOptions = Omit<CoreOptions, 'storage'>

export type NebulaOptions = NebulaBaseOptions &
	(
		| {
				connection: Connection
				uri?: never
				mongooseOptions?: never
		  }
		| {
				uri: string
				connection?: never
				mongooseOptions?: ConnectOptions
		  }
	)
