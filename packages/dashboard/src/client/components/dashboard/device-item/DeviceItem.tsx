import { useState } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'
import { FaComputer } from 'react-icons/fa6'
import { FaMobileAlt } from 'react-icons/fa'
import { IoIosGlobe } from 'react-icons/io'
import { FiTrash2 } from 'react-icons/fi'

import type { Dispatch, SetStateAction } from 'react'
import type { Device } from '../../../types/device'

import { deleteDevice } from '../../../lib/api/device'
import { formatDate, getDeviceName } from '../../../utils/dashboard'

import styles from './DeviceItem.module.css'

function getDeviceIcon(platform: string | undefined) {
	switch (platform?.toLowerCase()) {
		case 'windows':
		case 'macos':
		case 'linux':
			return <FaComputer />

		case 'android':
		case 'ios':
			return <FaMobileAlt />

		default:
			return <IoIosGlobe />
	}
}

interface DeviceItemProps {
	device: Device
	applicationName: string
	setDevices: Dispatch<SetStateAction<Device[]>>
}

export default function DeviceItem({ device, applicationName, setDevices }: DeviceItemProps) {
	const [expanded, setExpanded] = useState(false)
	const [deleting, setDeleting] = useState(false)

	const handleDelete = async () => {
		const confirmed = window.confirm(
			`Are you sure you want to delete this device (${getDeviceName(device)})?`,
		)

		if (!confirmed) return

		setDeleting(true)

		try {
			const success = await deleteDevice(device.id)
			console.log(success)
			if (success) {
				setDevices((prev) => prev.filter((item) => item.id !== device.id))
			} else {
				window.alert('Failed to delete device. Please try again.')
			}
		} catch (error) {
			console.error(error)
			window.alert('Something went wrong while deleting the device.')
		} finally {
			setDeleting(false)
		}
	}

	return (
		<div className={styles.listItem}>
			<button
				type="button"
				className={styles.itemButton}
				onClick={() => setExpanded((prev) => !prev)}
				aria-expanded={expanded}
			>
				<div className={styles.itemIcon}>{getDeviceIcon(device.info.platform)}</div>

				<div className={styles.itemDetails}>
					<strong>{getDeviceName(device)}</strong>
					<span>ID: {device.id}</span>
				</div>

				<div className={styles.deviceMeta}>
					<span
						className={`${styles.status} ${
							device.status === 'active' ? styles.statusActive : styles.statusRevoked
						}`}
					>
						{device.status}
					</span>

					<span className={styles.itemDate}>
						{formatDate(device.lastAuthenticatedAt ?? device.createdAt)}
					</span>
				</div>

				<span className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}>
					<RiArrowDownSLine />
				</span>
			</button>

			{expanded && (
				<div className={styles.expandedContent}>
					<div className={styles.detailsGrid}>
						<div className={styles.detail}>
							<span>Platform</span>
							<strong>{device.info.platform}</strong>
						</div>

						<div className={styles.detail}>
							<span>Operating System</span>
							<strong>{device.info.os}</strong>
						</div>

						<div className={styles.detail}>
							<span>OS Version</span>
							<strong>{device.info.osVersion}</strong>
						</div>

						<div className={styles.detail}>
							<span>App Version</span>
							<strong>{device.info.appVersion}</strong>
						</div>

						<div className={styles.detail}>
							<span>Enrolled</span>
							<strong>{formatDate(device.createdAt)}</strong>
						</div>

						<div className={styles.detail}>
							<span>Last Authenticated</span>
							<strong>
								{device.lastAuthenticatedAt ? formatDate(device.lastAuthenticatedAt) : 'Never'}
							</strong>
						</div>

						<div className={styles.detail}>
							<span>Application</span>
							<strong>{applicationName}</strong>
						</div>

						<div className={styles.detail}>
							<span>Application ID</span>
							<strong>{device.applicationId}</strong>
						</div>

						<div className={`${styles.detail} ${styles.fullWidth}`}>
							<span>Public Key</span>
							<strong className={styles.publicKey}>{device.publicKey}</strong>
						</div>
					</div>

					<div className={styles.actions}>
						<button
							type="button"
							className={styles.deleteButton}
							onClick={handleDelete}
							disabled={deleting}
						>
							<FiTrash2 />
							{deleting ? 'Deleting...' : 'Delete Device'}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
