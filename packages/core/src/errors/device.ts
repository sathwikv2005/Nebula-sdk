import { NebulaError } from './base.js'

export class DeviceError extends NebulaError {
	constructor(message: string) {
		super(message, 'DEVICE_ERROR')
	}
}
