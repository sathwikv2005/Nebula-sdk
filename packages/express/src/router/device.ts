import { Router } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

import { asyncHandler } from '../utils/async-handler.js'
import { getParam } from '../utils/getParam.js'

export function createDeviceRouter(core: CoreNebula): Router {
	const router = Router()

	// Get all devices
	router.get(
		'/',
		asyncHandler(async (_req, res) => {
			const devices = await core.device.getAll()

			res.json({
				ok: true,
				data: devices,
			})
		}),
	)

	// Get a device by ID
	router.get(
		'/:id',
		asyncHandler(async (req, res) => {
			const device = await core.device.get(getParam(req.params.id))

			res.json({
				ok: true,
				data: device,
			})
		}),
	)

	// Get devices belonging to an application
	router.get(
		'/application/:applicationId',
		asyncHandler(async (req, res) => {
			const devices = await core.device.getDevices(getParam(req.params.applicationId))

			res.json({
				ok: true,
				data: devices,
			})
		}),
	)

	// Delete a device
	router.delete(
		'/:id',
		asyncHandler(async (req, res) => {
			await core.device.deleteDevice(getParam(req.params.id))

			res.json({
				ok: true,
				message: 'Device deleted successfully',
			})
		}),
	)

	return router
}
