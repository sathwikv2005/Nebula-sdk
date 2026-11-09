import type { Connection } from 'mongoose'

import type {
	Application,
	Device,
	DeviceInfo,
	EnrollmentRequest,
	StorageAdapter,
} from '@nebula-sdk/core'

import { createNebulaModels } from './models.js'

export class MongooseAdapter implements StorageAdapter {
	private models: ReturnType<typeof createNebulaModels>

	constructor(connection: Connection) {
		this.models = createNebulaModels(connection)
	}

	async initialize(): Promise<void> {
		await Promise.all([
			this.models.Application.createIndexes(),
			this.models.Device.createIndexes(),
			this.models.Enrollment.createIndexes(),
		])
	}

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
			{
				id: applicationId,
			},
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

	async createEnrollmentRequest(request: EnrollmentRequest, now: number): Promise<boolean> {
		const session = await this.models.Application.db.startSession()

		try {
			const created = await session.withTransaction(async () => {
				const application = await this.models.Application.findOneAndUpdate(
					{
						id: request.applicationId,
						enrollmentEnabled: true,
						enrollmentRequestId: null,
						enrollmentExpiresAt: { $gt: now },
					},
					{
						$set: {
							enrollmentRequestId: request.id,
						},
					},
					{
						new: true,
						session,
					},
				).exec()

				if (!application) {
					return false
				}

				await this.models.Enrollment.create(
					[
						{
							...request,
							expiresAt: new Date(request.expiresAt),
						},
					],
					{ session },
				)

				return true
			})

			return created ?? false
		} finally {
			await session.endSession()
		}
	}

	async approveEnrollment(
		applicationId: string,
		codeHash: string,
		deviceId: string,
		now: number,
	): Promise<Device | null> {
		const session = await this.models.Enrollment.db.startSession()

		try {
			const device = await session.withTransaction(async (): Promise<Device | null> => {
				const enrollment = await this.models.Enrollment.findOne({
					applicationId,
					codeHash,
					status: 'pending',
					expiresAt: { $gt: new Date(now) },
				})
					.session(session)
					.lean<EnrollmentRequest>()
					.exec()

				if (!enrollment) {
					return null
				}

				const application = await this.models.Application.findOneAndUpdate(
					{
						id: applicationId,
						enrollmentEnabled: true,
						enrollmentRequestId: enrollment.id,
						enrollmentExpiresAt: { $gt: now },
					},
					{
						$set: {
							enrollmentEnabled: false,
							enrollmentExpiresAt: null,
							enrollmentRequestId: null,
							updatedAt: now,
						},
					},
					{
						new: true,
						session,
					},
				).exec()

				if (!application) {
					return null
				}

				const approved = await this.models.Enrollment.findOneAndUpdate(
					{
						id: enrollment.id,
						status: 'pending',
						expiresAt: { $gt: new Date(now) },
					},
					{
						$set: { status: 'approved' },
					},
					{
						new: true,
						session,
					},
				).exec()

				if (!approved) {
					return null
				}

				const [createdDevice] = await this.models.Device.create(
					[
						{
							id: deviceId,
							applicationId,
							publicKey: enrollment.publicKey,
							algorithm: 'Ed25519',
							info: enrollment.info,
							status: 'active',
							createdAt: now,
							lastAuthenticatedAt: null,
						},
					],
					{ session },
				)

				const result = createdDevice.toObject()

				delete result._id
				delete result.__v

				return result as Device
			})

			return device ?? null
		} finally {
			await session.endSession()
		}
	}

	async getDevice(id: string): Promise<Device | null> {
		return this.models.Device.findOne({ id }).select({ _id: 0 }).lean<Device>().exec()
	}

	async getDevices(applicationId: string): Promise<Device[]> {
		return this.models.Device.find({ applicationId })
			.select({ _id: 0 })
			.sort({ createdAt: -1 })
			.lean<Device[]>()
			.exec()
	}

	async updateDevice(id: string, updates: Partial<Device>): Promise<void> {
		const safeUpdates = { ...updates }
		delete safeUpdates.id

		await this.models.Device.updateOne(
			{ id },
			{ $set: safeUpdates },
			{ runValidators: true },
		).exec()
	}

	async deleteDevice(id: string): Promise<void> {
		await this.models.Device.deleteOne({ id }).exec()
	}
}
