import type { Dispatch, SetStateAction } from 'react'

import type { Application } from './application'
import type { Device } from './device'

export interface DashboardContext {
	applications: Application[]
	setApplications: Dispatch<SetStateAction<Application[]>>

	devices: Device[]
	setDevices: Dispatch<SetStateAction<Device[]>>

	loading: boolean
	error: string

	refreshDashboard: () => void
}
