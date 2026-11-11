import type { Connection } from 'mongoose'

import { applicationSchema } from './schemas/application.js'
import { deviceSchema } from './schemas/device.js'
import { enrollmentSchema } from './schemas/enrollment.js'
import { challengeSchema } from './schemas/challenges.js'
import { sessionSchema } from './schemas/session.js'

export function createNebulaModels(connection: Connection) {
	return {
		Application:
			connection.models.NebulaApplication ??
			connection.model('NebulaApplication', applicationSchema),

		Device: connection.models.NebulaDevice ?? connection.model('NebulaDevice', deviceSchema),

		Enrollment:
			connection.models.NebulaEnrollment ?? connection.model('NebulaEnrollment', enrollmentSchema),
		Challenges:
			connection.models.NebulaChallenges ?? connection.model('NebulaChallenges', challengeSchema),
		Session: connection.models.NebulaSession ?? connection.model('NebulaSession', sessionSchema),
	}
}

export async function initializeNebulaModels(connection: Connection) {
	const models = createNebulaModels(connection)

	await Promise.all([
		models.Application.createIndexes(),
		models.Device.createIndexes(),
		models.Enrollment.createIndexes(),
		models.Challenges.createIndexes(),
		models.Session.createIndexes(),
	])

	return models
}
