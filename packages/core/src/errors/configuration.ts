import { NebulaError } from './base.js'

export class ConfigurationError extends NebulaError {
	constructor(message: string) {
		super(message, 'CONFIGURATION_ERROR')
	}
}
