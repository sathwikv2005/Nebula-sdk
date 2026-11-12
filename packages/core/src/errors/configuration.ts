import { NebulaError } from './base.js'
import { NebulaErrorCode } from './errorCode.js'

export class ConfigurationError extends NebulaError {
	constructor(message: string) {
		super(message, NebulaErrorCode.CONFIGURATION)
	}
}
