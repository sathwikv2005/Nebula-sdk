import type { Application } from '@nebula-sdk/core'

import type { createNebulaModels } from '../models.js'

type NebulaModels = ReturnType<typeof createNebulaModels>

export class ApplicationAdapter {
	constructor(private readonly models: NebulaModels) {}

	async createApplication(application: Application): Promise<void> {
		await this.models.Application.create(application)
	}

	async getApplication(id: string): Promise<Application | null> {
		return this.models.Application.findOne({ id }).select({ _id: 0 }).lean<Application>().exec()
	}

	async getApplications(): Promise<Application[]> {
		return this.models.Application.find()
			.select({ _id: 0 })
			.sort({ createdAt: -1 })
			.lean<Application[]>()
			.exec()
	}

	async updateApplication(id: string, updates: Partial<Application>): Promise<void> {
		const safeUpdates = { ...updates }
		delete safeUpdates.id

		await this.models.Application.updateOne(
			{ id },
			{ $set: safeUpdates },
			{ runValidators: true },
		).exec()
	}

	async deleteApplication(id: string): Promise<void> {
		await this.models.Application.deleteOne({ id }).exec()
	}

	async enableEnrollment(applicationId: string, expiresAt: number, now: number): Promise<boolean> {
		const result = await this.models.Application.updateOne(
			{ id: applicationId },
			{
				$set: {
					enrollmentEnabled: true,
					enrollmentExpiresAt: expiresAt,
					enrollmentRequestId: null,
					updatedAt: now,
				},
			},
		).exec()

		return result.matchedCount > 0
	}

	async disableEnrollment(applicationId: string): Promise<boolean> {
		const result = await this.models.Application.updateOne(
			{ id: applicationId },
			{
				$set: {
					enrollmentEnabled: false,
					enrollmentExpiresAt: null,
					enrollmentRequestId: null,
					updatedAt: Date.now(),
				},
			},
		).exec()

		return result.matchedCount > 0
	}
}
