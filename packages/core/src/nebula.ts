import type { NebulaConfig, NebulaOptions } from './types/config.js'

import { ConfigurationError } from './errors/index.js'
import { EnrollmentService } from './services/enrollment.js'
import { ApplicationService } from './services/application.js'
import { SessionService } from './services/session.js'

const DEFAULT_ENROLLMENT_CODE_LENGTH = 6
const DEFAULT_ENROLLMENT_CODE_TTL = 300_000
const DEFAULT_CHALLENGE_TTL = 60_000
const DEFAULT_SESSION_TTL = 15 * 60_000

function validateDuration(name: string, value: number): void {
	if (!Number.isSafeInteger(value) || value <= 0) {
		throw new ConfigurationError(`${name} must be a positive safe integer`)
	}
}

export class Nebula {
	private readonly config: NebulaConfig
	public readonly enrollment: EnrollmentService
	public readonly application: ApplicationService
	public readonly session: SessionService

	constructor(options: NebulaOptions) {
		if (!options || typeof options !== 'object') {
			throw new ConfigurationError('Options must be an object')
		}

		if (!options.storage || typeof options.storage !== 'object' || Array.isArray(options.storage)) {
			throw new ConfigurationError('A valid storage adapter is required')
		}

		if (typeof options.secret !== 'string' || options.secret.length < 32) {
			throw new ConfigurationError('Secret must contain at least 32 characters')
		}

		const enrollmentCodeLength = options.enrollmentCodeLength ?? DEFAULT_ENROLLMENT_CODE_LENGTH

		const enrollmentCodeTtlMs = options.enrollmentCodeTtlMs ?? DEFAULT_ENROLLMENT_CODE_TTL

		const challengeTtlMs = options.challengeTtlMs ?? DEFAULT_CHALLENGE_TTL

		const sessionTtlMs = options.sessionTtlMs ?? DEFAULT_SESSION_TTL

		if (
			!Number.isInteger(enrollmentCodeLength) ||
			enrollmentCodeLength < 6 ||
			enrollmentCodeLength > 12
		) {
			throw new ConfigurationError('Enrollment code length must be an integer between 6 and 12')
		}

		validateDuration('enrollmentCodeTtlMs', enrollmentCodeTtlMs)
		validateDuration('challengeTtlMs', challengeTtlMs)
		validateDuration('sessionTtlMs', sessionTtlMs)

		this.config = {
			storage: options.storage,
			secret: options.secret,
			enrollmentCodeLength,
			enrollmentCodeTtlMs,
			challengeTtlMs,
			sessionTtlMs,
		}

		this.enrollment = new EnrollmentService(this.config)
		this.application = new ApplicationService(this.config)
		this.session = new SessionService(this.config)
	}

	async initialize(): Promise<void> {
		await this.config.storage.initialize?.()
	}
}
