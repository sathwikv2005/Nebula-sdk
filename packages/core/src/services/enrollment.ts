import { randomUUID } from 'node:crypto'

import type { NebulaConfig } from '../types/config.js'
import type { DeviceInfo, Device } from '../types/device.js'

import { EnrollmentError } from '../errors/index.js'

import { generateEnrollmentCode, hash } from '../crypto/hash.js'

import { validatePublicKey } from '../crypto/keys.js'

export interface CreateEnrollmentOptions {
	applicationId: string
	publicKey: string
	info?: DeviceInfo
}

export interface EnrollmentResult {
	id: string
	code: string
	expiresAt: number
}

export class EnrollmentService {
	constructor(private readonly config: NebulaConfig) {}

	async create(options: CreateEnrollmentOptions): Promise<EnrollmentResult> {
		const application = await this.config.storage.getApplication(options.applicationId)

		if (!application) {
			throw new EnrollmentError('Application not found')
		}

		if (!application.enrollmentEnabled) {
			throw new EnrollmentError('Device enrollment is disabled')
		}

		if (!options.publicKey) {
			throw new EnrollmentError('Device public key is required')
		}

		if (!validatePublicKey(options.publicKey)) {
			throw new EnrollmentError('Invalid Ed25519 public key')
		}

		const code = generateEnrollmentCode(this.config.enrollmentCodeLength)

		const now = Date.now()
		const expiresAt = now + this.config.enrollmentCodeTtlMs

		const request = {
			id: randomUUID(),
			applicationId: options.applicationId,
			codeHash: hash(`${options.applicationId}:${code}`, this.config.secret),
			publicKey: options.publicKey,
			info: options.info ?? {},
			status: 'pending' as const,
			createdAt: now,
			expiresAt,
		}

		await this.config.storage.createEnrollmentRequest(request)

		return {
			id: request.id,
			code,
			expiresAt,
		}
	}

	async approve(applicationId: string, code: string): Promise<Device> {
		this.validateCode(code)

		const codeHash = hash(`${applicationId}:${code}`, this.config.secret)

		const device = await this.config.storage.approveEnrollment(
			applicationId,
			codeHash,
			randomUUID(),
			Date.now(),
		)

		if (!device) {
			throw new EnrollmentError('Enrollment request not found, expired, or already processed')
		}

		return device
	}

	async reject(applicationId: string, code: string): Promise<void> {
		this.validateCode(code)

		const codeHash = hash(`${applicationId}:${code}`, this.config.secret)

		const rejected = await this.config.storage.rejectEnrollment(applicationId, codeHash, Date.now())

		if (!rejected) {
			throw new EnrollmentError('Enrollment request not found, expired, or already processed')
		}
	}

	private validateCode(code: string): void {
		if (
			typeof code !== 'string' ||
			!new RegExp(`^\\d{${this.config.enrollmentCodeLength}}$`).test(code)
		) {
			throw new EnrollmentError('Invalid enrollment code')
		}
	}
}
