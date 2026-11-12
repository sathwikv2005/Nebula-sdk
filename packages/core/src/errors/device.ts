import { NebulaError } from './base.js'
import { NebulaErrorCode } from './errorCode.js'

export class DeviceError extends NebulaError {
	constructor(message: string) {
		super(message, NebulaErrorCode.DEVICE)
	}
}
