import { DeviceError } from '../errors/device.js'
import { NebulaConfig } from '../types/config.js'
import { Device } from '../types/device.js'

export class DeviceService {
	constructor(private readonly config: NebulaConfig) {}

	async get(deviceId: string): Promise<Device> {
		const device = await this.config.storage.getDevice(deviceId)

		if (!device) {
			throw new DeviceError('Device not found')
		}

		return device
	}

	async getAll(): Promise<Device[]> {
		const devices = await this.config.storage.getAllDevices()
		return devices
	}

	async getDevices(applicationId: string): Promise<Device[]> {
		const devices = await this.config.storage.getDevices(applicationId)

		return devices
	}

	async deleteDevice(deviceId: string): Promise<void> {
		const device = await this.config.storage.getDevice(deviceId)

		if (!device) {
			throw new DeviceError('Device not found')
		}

		await this.config.storage.deleteDevice(deviceId)
		await this.config.storage.decrementDeviceCount(device.applicationId)
	}
}
