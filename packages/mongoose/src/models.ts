import type { Connection } from 'mongoose'

import { applicationSchema } from './schemas/application.js'
import { deviceSchema } from './schemas/device.js'
import { enrollmentSchema } from './schemas/enrollment.js'

export function createNebulaModels(connection: Connection) {
	return {
		Application:
			connection.models.NebulaApplication ??
			connection.model('NebulaApplication', applicationSchema),

		Device: connection.models.NebulaDevice ?? connection.model('NebulaDevice', deviceSchema),

		Enrollment:
			connection.models.NebulaEnrollment ?? connection.model('NebulaEnrollment', enrollmentSchema),
	}
}

export async function initializeNebulaModels(connection: Connection) {
	const models = createNebulaModels(connection)

	await Promise.all([
		models.Application.createIndexes(),
		models.Device.createIndexes(),
		models.Enrollment.createIndexes(),
	])

	return models
}
