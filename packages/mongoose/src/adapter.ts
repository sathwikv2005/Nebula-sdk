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

	async createEnrollmentRequest(request: EnrollmentRequest): Promise<void> {
		await this.models.Enrollment.create({
			...request,
			expiresAt: new Date(request.expiresAt),
		})
	}

	async approveEnrollment(
		applicationId: string,
		codeHash: string,
		deviceId: string,
		now: number,
	): Promise<Device | null> {
		const session = await this.models.Enrollment.db.startSession()

		try {
			const result = await session.withTransaction(async (): Promise<Device | null> => {
				const enrollment = (await this.models.Enrollment.findOneAndUpdate(
					{
						applicationId,
						codeHash,
						status: 'pending',
						expiresAt: { $gt: new Date(now) },
					},
					{
						$set: { status: 'approved' },
					},
					{
						new: false,
						session,
					},
				)
					.lean()
					.exec()) as {
					applicationId: string
					publicKey: string
					info: DeviceInfo
				} | null

				if (!enrollment) {
					return null
				}

				const [createdDevice] = await this.models.Device.create(
					[
						{
							id: deviceId,
							applicationId: enrollment.applicationId,
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

				const device = createdDevice.toObject()
				delete device._id
				delete device.__v

				return device as Device
			})

			return result ?? null
		} finally {
			await session.endSession()
		}
	}

	async rejectEnrollment(applicationId: string, codeHash: string, now: number): Promise<boolean> {
		const result = await this.models.Enrollment.findOneAndUpdate(
			{
				applicationId,
				codeHash,
				status: 'pending',
				expiresAt: { $gt: new Date(now) },
			},
			{
				$set: { status: 'rejected' },
			},
			{
				new: true,
			},
		).exec()

		return result !== null
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
