import type { Connection } from 'mongoose'

import type { Application, Device, EnrollmentRequest, StorageAdapter } from '@nebula-sdk/core'

import { initializeNebulaModels, createNebulaModels } from './models.js'

import { ApplicationAdapter } from './adapters/application.adapter.js'
import { DeviceAdapter } from './adapters/device.adapter.js'
import { EnrollmentAdapter } from './adapters/enrollment.adapter.js'

export class MongooseAdapter implements StorageAdapter {
	private readonly application: ApplicationAdapter
	private readonly device: DeviceAdapter
	private readonly enrollment: EnrollmentAdapter

	constructor(private readonly connection: Connection) {
		const models = createNebulaModels(connection)

		this.application = new ApplicationAdapter(models)
		this.device = new DeviceAdapter(models)
		this.enrollment = new EnrollmentAdapter(models)
	}

	async initialize(): Promise<void> {
		await initializeNebulaModels(this.connection)
	}

	createApplication(application: Application): Promise<void> {
		return this.application.createApplication(application)
	}

	getApplication(id: string): Promise<Application | null> {
		return this.application.getApplication(id)
	}

	getApplications(): Promise<Application[]> {
		return this.application.getApplications()
	}

	updateApplication(id: string, updates: Partial<Application>): Promise<void> {
		return this.application.updateApplication(id, updates)
	}

	deleteApplication(id: string): Promise<void> {
		return this.application.deleteApplication(id)
	}

	enableEnrollment(applicationId: string, expiresAt: number, now: number): Promise<boolean> {
		return this.application.enableEnrollment(applicationId, expiresAt, now)
	}

	disableEnrollment(applicationId: string): Promise<boolean> {
		return this.application.disableEnrollment(applicationId)
	}

	createEnrollmentRequest(request: EnrollmentRequest, now: number): Promise<boolean> {
		return this.enrollment.createEnrollmentRequest(request, now)
	}

	approveEnrollment(
		applicationId: string,
		codeHash: string,
		deviceId: string,
		now: number,
	): Promise<Device | null> {
		return this.enrollment.approveEnrollment(applicationId, codeHash, deviceId, now)
	}

	getDevice(id: string): Promise<Device | null> {
		return this.device.getDevice(id)
	}

	getDevices(applicationId: string): Promise<Device[]> {
		return this.device.getDevices(applicationId)
	}

	updateDevice(id: string, updates: Partial<Device>): Promise<void> {
		return this.device.updateDevice(id, updates)
	}

	deleteDevice(id: string): Promise<void> {
		return this.device.deleteDevice(id)
	}
}
