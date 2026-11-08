import type { Application } from '../types/application.js'
import type { Device } from '../types/device.js'
import type { EnrollmentRequest } from '../types/enrollment.js'

export interface StorageAdapter {
	initialize?(): Promise<void>

	createApplication(application: Application): Promise<void>
	getApplication(id: string): Promise<Application | null>
	updateApplication(id: string, updates: Partial<Application>): Promise<void>
	deleteApplication(id: string): Promise<void>

	enableEnrollment(applicationId: string, expiresAt: number, now: number): Promise<boolean>

	disableEnrollment(applicationId: string): Promise<boolean>

	createEnrollmentRequest(request: EnrollmentRequest, now: number): Promise<boolean>

	approveEnrollment(
		applicationId: string,
		codeHash: string,
		deviceId: string,
		now: number,
	): Promise<Device | null>

	getDevice(id: string): Promise<Device | null>
	getDevices(applicationId: string): Promise<Device[]>
	updateDevice(id: string, updates: Partial<Device>): Promise<void>
	deleteDevice(id: string): Promise<void>
}
