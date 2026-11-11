import type { Device } from '@nebula-sdk/core'

import type { createNebulaModels } from '../models.js'

type NebulaModels = ReturnType<typeof createNebulaModels>

export class DeviceAdapter {
	constructor(private readonly models: NebulaModels) {}

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
