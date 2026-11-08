import type { Connection } from 'mongoose'

import { applicationSchema } from './schemas/application'
import { deviceSchema } from './schemas/device'
import { enrollmentSchema } from './schemas/enrollment'

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
