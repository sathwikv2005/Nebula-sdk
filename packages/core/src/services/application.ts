import { randomUUID } from 'node:crypto'

import type { Application } from '../types/application.js'
import type { NebulaConfig } from '../types/config.js'

import { ApplicationError } from '../errors/application.js'

export interface CreateApplicationOptions {
	name: string
	enrollmentEnabled?: boolean
}

export interface UpdateApplicationOptions {
	name?: string
}

export class ApplicationService {
	constructor(private readonly config: NebulaConfig) {}

	async create(options: CreateApplicationOptions): Promise<Application> {
		const name = options.name?.trim()

		if (!name) {
			throw new ApplicationError('Application name is required')
		}

		const now = Date.now()

		const application: Application = {
			id: randomUUID(),
			name,
			enrollmentEnabled: false,
			enrollmentExpiresAt: null,
			enrollmentRequestId: null,
			createdAt: now,
			updatedAt: now,
		}

		await this.config.storage.createApplication(application)

		return application
	}

	async get(id: string): Promise<Application> {
		const application = await this.config.storage.getApplication(id)

		if (!application) {
			throw new ApplicationError('Application not found')
		}

		return application
	}

	async getAll(): Promise<Application[]> {
		return this.config.storage.getApplications()
	}

	async update(id: string, updates: UpdateApplicationOptions): Promise<Application> {
		const application = await this.get(id)

		const safeUpdates: Partial<Application> = {}

		if (updates.name !== undefined) {
			const name = updates.name.trim()

			if (!name) {
				throw new ApplicationError('Application name cannot be empty')
			}

			safeUpdates.name = name
		}

		if (Object.keys(safeUpdates).length === 0) {
			return application
		}

		safeUpdates.updatedAt = Date.now()

		await this.config.storage.updateApplication(id, safeUpdates)

		return this.get(id)
	}

	async delete(id: string): Promise<void> {
		await this.get(id)
		await this.config.storage.deleteApplication(id)
	}
}
