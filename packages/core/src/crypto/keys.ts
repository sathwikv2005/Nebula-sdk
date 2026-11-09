import { AuthenticationError } from '../errors/index.js'
import { createPublicKey, type KeyObject } from 'node:crypto'

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex')

function parsePublicKey(publicKey: string): KeyObject {
	const parts = publicKey.trim().split(/\s+/)

	if (parts[0] === 'ssh-ed25519') {
		if (!parts[1]) {
			throw new Error('Missing OpenSSH public key data')
		}

		const blob = Buffer.from(parts[1], 'base64')

		if (blob.length < 4) {
			throw new Error('Invalid OpenSSH key')
		}

		const algorithmLength = blob.readUInt32BE(0)

		if (algorithmLength !== 11 || 4 + algorithmLength + 4 > blob.length) {
			throw new Error('Invalid OpenSSH key')
		}

		const algorithm = blob.subarray(4, 4 + algorithmLength).toString()

		if (algorithm !== 'ssh-ed25519') {
			throw new Error('Unsupported key algorithm')
		}

		const keyLengthOffset = 4 + algorithmLength
		const keyLength = blob.readUInt32BE(keyLengthOffset)

		if (keyLength !== 32 || keyLengthOffset + 4 + keyLength !== blob.length) {
			throw new Error('Invalid Ed25519 key length')
		}

		const rawKey = blob.subarray(keyLengthOffset + 4)

		return createPublicKey({
			key: Buffer.concat([ED25519_SPKI_PREFIX, rawKey]),
			format: 'der',
			type: 'spki',
		})
	}

	return createPublicKey({
		key: Buffer.from(publicKey, 'base64'),
		format: 'der',
		type: 'spki',
	})
}

export function validatePublicKey(publicKey: string): boolean {
	try {
		return parsePublicKey(publicKey).asymmetricKeyType === 'ed25519'
	} catch {
		return false
	}
}

export function normalizePublicKey(publicKey: string): string {
	const key = parsePublicKey(publicKey)

	if (key.asymmetricKeyType !== 'ed25519') {
		throw new Error('Invalid Ed25519 public key')
	}

	return key
		.export({
			format: 'der',
			type: 'spki',
		})
		.toString('base64')
}
