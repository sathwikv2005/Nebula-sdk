import type { Connection } from 'mongoose'

import type { StorageAdapter } from '@nebula-sdk/core'

import type { Application } from '@nebula-sdk/core'
import type { Device } from '@nebula-sdk/core'
import type { EnrollmentRequest } from '@nebula-sdk/core'

import { createNebulaModels } from './models'

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
		const application = await this.models.Application.findOne({ id }).lean().exec()

		return application as Application | null
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

		let approvedDevice: Device | null = null

		try {
			await session.withTransaction(async () => {
				const enrollment = await this.models.Enrollment.findOneAndUpdate(
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
					.exec()

				if (!enrollment) {
					approvedDevice = null
					return
				}

				const device = {
					id: deviceId,
					applicationId: enrollment.applicationId,
					publicKey: enrollment.publicKey,
					algorithm: 'Ed25519' as const,
					info: enrollment.info,
					status: 'active' as const,
					createdAt: now,
					lastAuthenticatedAt: null,
				}

				const [createdDevice] = await this.models.Device.create([device], { session })

				approvedDevice = createdDevice.toObject() as Device
			})
		} finally {
			await session.endSession()
		}

		return approvedDevice
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
		const device = await this.models.Device.findOne({ id }).lean().exec()

		return device as Device | null
	}

	async getDevices(applicationId: string): Promise<Device[]> {
		const devices = await this.models.Device.find({ applicationId })
			.sort({ createdAt: -1 })
			.lean()
			.exec()

		return devices as Device[]
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
