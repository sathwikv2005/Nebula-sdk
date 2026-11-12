import type { Device, EnrollmentRequest } from '@nebula-sdk/core'

import type { createNebulaModels } from '../models.js'

type NebulaModels = ReturnType<typeof createNebulaModels>

export class EnrollmentAdapter {
	constructor(private readonly models: NebulaModels) {}

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
}
