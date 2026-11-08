import type { Connection } from 'mongoose'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

type CoreOptions = ConstructorParameters<typeof CoreNebula>[0]

export type NebulaOptions = Omit<CoreOptions, 'storage'> & {
	database: Connection
}
