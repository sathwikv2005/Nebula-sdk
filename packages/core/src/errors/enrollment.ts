import { NebulaError } from './base.js'
import { NebulaErrorCode } from './errorCode.js'

export class EnrollmentError extends NebulaError {
	constructor(message: string) {
		super(message, NebulaErrorCode.ENROLLMENT)
	}
}
