import { NebulaError } from './base.js'
import { NebulaErrorCode } from './errorCode.js'

export class ApplicationError extends NebulaError {
	constructor(message: string) {
		super(message, NebulaErrorCode.APPLICATION)
	}
}
