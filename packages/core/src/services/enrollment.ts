import { randomUUID } from 'node:crypto'

import type { NebulaConfig } from '../types/config.js'
import type { DeviceInfo, Device } from '../types/device.js'

import { EnrollmentError, ConfigurationError } from '../errors/index.js'

import { hash } from '../crypto/hash.js'
import { validatePublicKey } from '../crypto/keys.js'

export interface CreateEnrollmentOptions {
	applicationId: string
	code: string
	publicKey: string
	info?: DeviceInfo
}

export interface EnrollmentWindow {
	applicationId: string
	expiresAt: number
}

export class EnrollmentService {
	constructor(private readonly config: NebulaConfig) {}

	async enable(applicationId: string): Promise<EnrollmentWindow> {
		const application = await this.config.storage.getApplication(applicationId)

		if (!application) {
			throw new EnrollmentError('Application not found')
		}

		const now = Date.now()
		const expiresAt = now + this.config.enrollmentCodeTtlMs

		const enabled = await this.config.storage.enableEnrollment(applicationId, expiresAt, now)

		if (!enabled) {
			throw new EnrollmentError('Could not enable enrollment')
		}

		return {
			applicationId,
			expiresAt,
		}
	}

	async disable(applicationId: string): Promise<void> {
		const application = await this.config.storage.getApplication(applicationId)

		if (!application) {
			throw new EnrollmentError('Application not found')
		}

		await this.config.storage.disableEnrollment(applicationId)
	}

	async request(options: CreateEnrollmentOptions): Promise<void> {
		const application = await this.config.storage.getApplication(options.applicationId)

		if (!application) {
			throw new EnrollmentError('Application not found')
		}

		if (!application.enrollmentEnabled) {
			throw new EnrollmentError('Device enrollment is disabled')
		}

		if (!application.enrollmentExpiresAt || application.enrollmentExpiresAt <= Date.now()) {
			throw new EnrollmentError('Enrollment window has expired')
		}

		this.validateCode(options.code)

		if (!validatePublicKey(options.publicKey)) {
			throw new EnrollmentError('Invalid Ed25519 public key')
		}

		const now = Date.now()

		const request = {
			id: randomUUID(),
			applicationId: options.applicationId,
			codeHash: hash(`${options.applicationId}:${options.code}`, this.config.secret),
			publicKey: options.publicKey,
			info: options.info ?? {},
			status: 'pending' as const,
			createdAt: now,
			expiresAt: application.enrollmentExpiresAt,
		}

		const created = await this.config.storage.createEnrollmentRequest(request, now)

		if (!created) {
			throw new EnrollmentError(
				'Enrollment window is unavailable or another device has already requested enrollment',
			)
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

	private validateCode(code: string): void {
		if (
			typeof code !== 'string' ||
			!new RegExp(`^\\d{${this.config.enrollmentCodeLength}}$`).test(code)
		) {
			throw new EnrollmentError('Invalid enrollment code')
		}
	}
}
