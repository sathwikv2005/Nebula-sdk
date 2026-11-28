import { randomUUID } from 'node:crypto'

import type { NebulaConfig } from '../types/config.js'
import type { DeviceInfo, Device } from '../types/device.js'
import type { EnrollmentRequest, EnrollmentRequestResponse } from '../types/enrollment.js'

import { EnrollmentError } from '../errors/index.js'

import { hash } from '../crypto/hash.js'
import { normalizePublicKey, validatePublicKey } from '../crypto/keys.js'

export interface CreateEnrollmentOptions {
	code: string
	publicKey: string
	info?: DeviceInfo
}

export interface EnrollmentWindow {
	expiresAt: number
}

export class EnrollmentService {
	constructor(private readonly config: NebulaConfig) {}

	async getRequests(): Promise<EnrollmentRequestResponse[]> {
		return this.config.storage.getEnrollmentReuests()
	}

	async enable(): Promise<EnrollmentWindow> {
		const now = Date.now()
		const expiresAt = now + this.config.enrollmentCodeTtlMs

		const enabled = await this.config.storage.enableEnrollment(expiresAt, now)

		if (!enabled) {
			throw new EnrollmentError('Could not enable enrollment')
		}

		return { expiresAt }
	}

	async disable(): Promise<void> {
		await this.config.storage.disableEnrollment()
	}

	async request(options: CreateEnrollmentOptions): Promise<void> {
		const now = Date.now()

		const window = await this.config.storage.getEnrollmentWindow()

		if (!window || window.expiresAt <= now) {
			throw new EnrollmentError(
				'Device enrollment is disabled or the enrollment window has expired',
			)
		}

		this.validateCode(options.code)

		if (!validatePublicKey(options.publicKey)) {
			throw new EnrollmentError('Invalid public key')
		}

		const publicKey = normalizePublicKey(options.publicKey)

		const request: EnrollmentRequest = {
			id: randomUUID(),
			codeHash: hash(options.code, this.config.secret),
			publicKey,
			info: options.info ?? {},
			status: 'pending',
			createdAt: now,
			expiresAt: window.expiresAt,
		}

		const created = await this.config.storage.createEnrollmentRequest(request, now)

		if (!created) {
			throw new EnrollmentError(
				'Enrollment window is unavailable or another device has already requested enrollment',
			)
		}
	}

	async approve(requestId: string, applicationId: string): Promise<Device> {
		const application = await this.config.storage.getApplication(applicationId)

		if (!application) {
			throw new EnrollmentError('Application not found')
		}

		const device = await this.config.storage.approveEnrollment(
			requestId,
			applicationId,
			randomUUID(),
			Date.now(),
		)

		if (!device) {
			throw new EnrollmentError('Enrollment request not found, expired, or already processed')
		}

		await this.config.storage.updateApplication(applicationId, {
			deviceCount: application.deviceCount + 1,
		})

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
