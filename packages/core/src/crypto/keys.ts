import { createPublicKey, verify, type KeyObject } from 'node:crypto'

export type KeyAlgorithm = 'ed25519' | 'ecdsa-p256'

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex')

function parseOpenSSHEd25519(publicKey: string): KeyObject {
	const parts = publicKey.trim().split(/\s+/)

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

function parsePublicKey(publicKey: string): KeyObject {
	const trimmed = publicKey.trim()

	if (trimmed.startsWith('ssh-ed25519 ')) {
		return parseOpenSSHEd25519(trimmed)
	}

	return createPublicKey({
		key: Buffer.from(trimmed, 'base64'),
		format: 'der',
		type: 'spki',
	})
}

function getKeyAlgorithm(key: KeyObject): KeyAlgorithm | null {
	switch (key.asymmetricKeyType) {
		case 'ed25519':
			return 'ed25519'

		case 'ec':
			if (key.asymmetricKeyDetails?.namedCurve === 'prime256v1') {
				return 'ecdsa-p256'
			}

			return null

		default:
			return null
	}
}

export function validatePublicKey(publicKey: string): boolean {
	try {
		return getKeyAlgorithm(parsePublicKey(publicKey)) !== null
	} catch {
		return false
	}
}

export function getPublicKeyAlgorithm(publicKey: string): KeyAlgorithm | null {
	try {
		return getKeyAlgorithm(parsePublicKey(publicKey))
	} catch {
		return null
	}
}

export function normalizePublicKey(publicKey: string): string {
	const key = parsePublicKey(publicKey)

	if (!getKeyAlgorithm(key)) {
		throw new Error('Unsupported public key algorithm')
	}

	return key
		.export({
			format: 'der',
			type: 'spki',
		})
		.toString('base64')
}

export function verifySignature(publicKey: string, message: string, signature: string): boolean {
	try {
		const key = parsePublicKey(publicKey)
		const algorithm = getKeyAlgorithm(key)

		if (!algorithm) {
			return false
		}

		const digest = algorithm === 'ed25519' ? null : 'sha256'

		const signatureBuffer = Buffer.from(signature, 'base64')

		if (signatureBuffer.length === 0) {
			return false
		}

		return verify(digest, Buffer.from(message, 'utf8'), key, signatureBuffer)
	} catch {
		return false
	}
}
