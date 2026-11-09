import type { NebulaConfig, NebulaOptions } from './types/config.js'

import { ConfigurationError } from './errors/index.js'
import { EnrollmentService } from './services/enrollment.js'
import { ApplicationService } from './services/application.js'

export class Nebula {
	public readonly config: NebulaConfig
	public readonly enrollment: EnrollmentService
	public readonly application: ApplicationService

	constructor(options: NebulaOptions) {
		if (!options.storage) {
			throw new ConfigurationError('A storage adapter is required')
		}

		if (!options.secret || options.secret.length < 32) {
			throw new ConfigurationError('Secret must contain at least 32 characters')
		}

		this.config = {
			storage: options.storage,
			secret: options.secret,
			enrollmentCodeLength: options.enrollmentCodeLength ?? 6,
			enrollmentCodeTtlMs: options.enrollmentCodeTtlMs ?? 300_000,
			challengeTtlMs: options.challengeTtlMs ?? 60_000,
		}

		if (
			!Number.isInteger(this.config.enrollmentCodeLength) ||
			this.config.enrollmentCodeLength < 6 ||
			this.config.enrollmentCodeLength > 12
		) {
			throw new ConfigurationError('Enrollment code length must be between 6 and 12')
		}

		if (
			!Number.isFinite(this.config.enrollmentCodeTtlMs) ||
			this.config.enrollmentCodeTtlMs <= 0 ||
			!Number.isFinite(this.config.challengeTtlMs) ||
			this.config.challengeTtlMs <= 0
		) {
			throw new ConfigurationError('Expiration durations must be positive')
		}

		this.enrollment = new EnrollmentService(this.config)
		this.application = new ApplicationService(this.config)
	}

	async initialize(): Promise<void> {
		await this.config.storage.initialize?.()
	}
}
