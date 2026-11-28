import type {
	Device,
	EnrollmentRequest,
	EnrollmentRequestResponse,
	EnrollmentWindow,
} from '@nebula-sdk/core'

import type { createNebulaModels } from '../models.js'

type NebulaModels = ReturnType<typeof createNebulaModels>

export class EnrollmentAdapter {
	constructor(private readonly models: NebulaModels) {}

	async getEnrollmentWindow(): Promise<EnrollmentWindow | null> {
		const state = await this.models.EnrollmentState.findOne({
			id: 'global',
			expiresAt: { $gt: new Date() },
		})
			.lean()
			.exec()

		if (!state?.expiresAt) {
			return null
		}

		return {
			expiresAt: new Date(state.expiresAt).getTime(),
		}
	}

	async enableEnrollment(expiresAt: number, now: number): Promise<boolean> {
		const session = await this.models.EnrollmentState.db.startSession()

		try {
			const enabled = await session.withTransaction(async () => {
				const previousState = await this.models.EnrollmentState.findOne({
					id: 'global',
				})
					.session(session)
					.lean()
					.exec()

				// Reject any previous pending request.
				if (previousState?.requestId) {
					await this.models.Enrollment.updateOne(
						{
							id: previousState.requestId,
							status: 'pending',
						},
						{
							$set: { status: 'rejected' },
						},
						{ session },
					).exec()
				}

				await this.models.EnrollmentState.findOneAndUpdate(
					{ id: 'global' },
					{
						$set: {
							expiresAt: new Date(expiresAt),
							enabledAt: now,
							requestId: null,
						},
					},
					{
						upsert: true,
						new: true,
						session,
					},
				).exec()

				return true
			})

			return enabled ?? false
		} finally {
			await session.endSession()
		}
	}

	async disableEnrollment(): Promise<void> {
		const session = await this.models.EnrollmentState.db.startSession()

		try {
			await session.withTransaction(async () => {
				const state = await this.models.EnrollmentState.findOne({
					id: 'global',
				})
					.session(session)
					.lean()
					.exec()

				if (state?.requestId) {
					await this.models.Enrollment.updateOne(
						{
							id: state.requestId,
							status: 'pending',
						},
						{
							$set: { status: 'rejected' },
						},
						{ session },
					).exec()
				}

				await this.models.EnrollmentState.updateOne(
					{ id: 'global' },
					{
						$set: {
							expiresAt: null,
							enabledAt: null,
							requestId: null,
						},
					},
					{ session },
				).exec()
			})
		} finally {
			await session.endSession()
		}
	}

	async createEnrollmentRequest(request: EnrollmentRequest, now: number): Promise<boolean> {
		const session = await this.models.EnrollmentState.db.startSession()

		try {
			const created = await session.withTransaction(async () => {
				// Atomically claim the global enrollment window.
				const state = await this.models.EnrollmentState.findOneAndUpdate(
					{
						id: 'global',
						expiresAt: { $gt: new Date(now) },
						requestId: null,
					},
					{
						$set: {
							requestId: request.id,
						},
					},
					{
						new: true,
						session,
					},
				).exec()

				if (!state) {
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
		requestId: string,
		applicationId: string,
		deviceId: string,
		now: number,
	): Promise<Device | null> {
		const session = await this.models.Enrollment.db.startSession()

		try {
			const device = await session.withTransaction(async (): Promise<Device | null> => {
				// Validate the application first.
				const application = await this.models.Application.findOne({
					id: applicationId,
				})
					.session(session)
					.select('id')
					.lean()
					.exec()

				if (!application) {
					return null
				}

				// Verify that this request owns the active enrollment window.
				const state = await this.models.EnrollmentState.findOne({
					id: 'global',
					requestId,
					expiresAt: { $gt: new Date(now) },
				})
					.session(session)
					.lean()
					.exec()

				if (!state) {
					return null
				}

				// Verify the enrollment request.
				const enrollment = await this.models.Enrollment.findOne({
					id: requestId,
					status: 'pending',
					expiresAt: { $gt: new Date(now) },
				})
					.session(session)
					.lean<EnrollmentRequest>()
					.exec()

				if (!enrollment) {
					return null
				}

				// Atomically close the enrollment window.
				const closed = await this.models.EnrollmentState.findOneAndUpdate(
					{
						id: 'global',
						requestId,
						expiresAt: { $gt: new Date(now) },
					},
					{
						$set: {
							expiresAt: null,
							enabledAt: null,
							requestId: null,
						},
					},
					{
						new: true,
						session,
					},
				).exec()

				if (!closed) {
					throw new Error('ENROLLMENT_STATE_CHANGED')
				}

				// Mark the enrollment request as approved.
				const approved = await this.models.Enrollment.findOneAndUpdate(
					{
						id: requestId,
						status: 'pending',
						expiresAt: { $gt: new Date(now) },
					},
					{
						$set: {
							status: 'approved',
						},
					},
					{
						new: true,
						session,
					},
				).exec()

				if (!approved) {
					throw new Error('ENROLLMENT_REQUEST_CHANGED')
				}

				// Create the device under the selected application.
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
		} catch (error) {
			if (
				error instanceof Error &&
				(error.message === 'ENROLLMENT_STATE_CHANGED' ||
					error.message === 'ENROLLMENT_REQUEST_CHANGED')
			) {
				return null
			}

			throw error
		} finally {
			await session.endSession()
		}
	}

	async getEnrollmentRequests(): Promise<EnrollmentRequestResponse[]> {
		const requests = await this.models.Enrollment.find({
			status: 'pending',
			expiresAt: { $gt: new Date() },
		})
			.select('-codeHash -_id -__v')
			.lean()
			.exec()

		return requests.map((request) => ({
			...request,
			expiresAt: new Date(request.expiresAt).getTime(),
			createdAt: new Date(request.createdAt).getTime(),
		})) as EnrollmentRequestResponse[]
	}
}
