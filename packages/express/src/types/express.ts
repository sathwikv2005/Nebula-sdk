import type { Device, Application as NebulaApplication } from '@nebula-sdk/core'
import { NebulaExpressSession } from './nebulaExpressSession'

declare global {
	namespace Express {
		interface Request {
			nebula?: {
				session: NebulaExpressSession
				device?: Device
				application?: NebulaApplication
			}
		}
	}
}

export {}
