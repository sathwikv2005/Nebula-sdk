import { NebulaExpressErrorCode } from '../errors/errorCode'
import { NebulaExpressError } from '../errors/expressError'

export function getParam(value: string | string[] | undefined): string {
	if (typeof value !== 'string') {
		throw new NebulaExpressError('Invalid route parameter', NebulaExpressErrorCode.INVALID_REQUEST)
	}

	return value
}
