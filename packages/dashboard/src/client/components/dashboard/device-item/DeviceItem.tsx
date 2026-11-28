import type { Device } from '../../../types/device'
import { formatDate, getDeviceName } from '../../../utils/dashboard'

import styles from './DeviceItem.module.css'

interface DeviceItemProps {
	device: Device
}

export default function DeviceItem({ device }: DeviceItemProps) {
	return (
		<div className={styles.listItem}>
			<div className={styles.itemIcon}>▣</div>

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
		</div>
	)
}
