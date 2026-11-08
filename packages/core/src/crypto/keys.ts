import { createPublicKey, verify } from 'node:crypto'

import { AuthenticationError } from '../errors/index.js'

export function validatePublicKey(publicKey: string): boolean {
	try {
		const key = createPublicKey({
			key: Buffer.from(publicKey, 'base64'),
			format: 'der',
			type: 'spki',
		})

		return key.asymmetricKeyType === 'ed25519'
	} catch {
		return false
	}
}

export function verifyDeviceSignature(
	publicKey: string,
	message: string,
	signature: string,
): boolean {
	try {
		const key = createPublicKey({
			key: Buffer.from(publicKey, 'base64'),
			format: 'der',
			type: 'spki',
		})

		if (key.asymmetricKeyType !== 'ed25519') {
			throw new AuthenticationError('Invalid device key algorithm')
		}

		return verify(null, Buffer.from(message), key, Buffer.from(signature, 'base64'))
	} catch (error) {
		if (error instanceof AuthenticationError) {
			throw error
		}

		return false
	}
}
