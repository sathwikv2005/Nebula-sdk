import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router'
import {
	LuShieldCheck,
	LuShieldOff,
	LuClock,
	LuRefreshCw,
	LuSmartphone,
	LuMonitor,
	LuCheck,
	LuX,
	LuCopy,
	LuKeyRound,
	LuCalendarClock,
	LuLoaderCircle,
	LuPlus,
	LuChevronDown,
	LuPackage,
} from 'react-icons/lu'
import { FiAlertCircle } from 'react-icons/fi'

import {
	getEnrollmentWindow,
	getEnrollmentRequests,
	enableEnrollment,
	disableEnrollment,
	approveEnrollment,
} from '../../lib/api/enrollment'

import EmptyState from '../../components/dashboard/empty-state/EmptyState'

import type { DashboardContext } from '../../types/dashboard'
import type { EnrollmentRequest, EnrollmentWindow } from '../../types/enrollment'

import styles from './Enrollment.module.css'

function formatDate(timestamp: number | null | undefined) {
	if (!timestamp) return 'Never'

	return new Date(timestamp).toLocaleString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

function getTimeRemaining(timestamp: number) {
	const remaining = timestamp - Date.now()

	if (remaining <= 0) return 'Expired'

	const minutes = Math.floor(remaining / 60000)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)

	if (days > 0) return `${days}d ${hours % 24}h remaining`
	if (hours > 0) return `${hours}h ${minutes % 60}m remaining`

	return `${minutes}m remaining`
}

function getDeviceName(request: EnrollmentRequest) {
	return request.info.name || 'Unknown device'
}

function getDeviceIcon(platform?: string) {
	if (!platform) return <LuSmartphone />

	const value = platform.toLowerCase()

	if (
		value.includes('windows') ||
		value.includes('mac') ||
		value.includes('linux') ||
		value.includes('desktop')
	) {
		return <LuMonitor />
	}

	return <LuSmartphone />
}

export default function Enrollment() {
	const { applications, loading, error, refreshDashboard } = useOutletContext<DashboardContext>()

	const [enrollmentWindow, setWindow] = useState<EnrollmentWindow | null>(null)
	const [requests, setRequests] = useState<EnrollmentRequest[]>([])

	const [fetching, setFetching] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [actionLoading, setActionLoading] = useState(false)

	const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
	const [selectedApplications, setSelectedApplications] = useState<Record<string, string>>({})
	const [codes, setCodes] = useState<Record<string, string>>({})

	const [message, setMessage] = useState<{
		type: 'success' | 'error'
		text: string
	} | null>(null)

	useEffect(() => {
		if (!message) return

		const timeout = window.setTimeout(() => {
			setMessage(null)
		}, 4000)

		return () => window.clearTimeout(timeout)
	}, [message])

	const [now, setNow] = useState(Date.now())

	const fetchData = useCallback(async (showRefreshing = false) => {
		if (showRefreshing) setRefreshing(true)
		else setFetching(true)

		const [windowResult, requestsResult] = await Promise.all([
			getEnrollmentWindow(),
			getEnrollmentRequests(),
		])

		setWindow(windowResult)
		setRequests(requestsResult ?? [])

		setFetching(false)
		setRefreshing(false)
	}, [])

	useEffect(() => {
		void fetchData()

		const interval = setInterval(() => {
			setNow(Date.now())
		}, 1000)

		return () => clearInterval(interval)
	}, [fetchData])

	const isEnabled =
		enrollmentWindow?.enabled === true &&
		enrollmentWindow.expiresAt !== null &&
		enrollmentWindow.expiresAt > now

	const pendingRequests = requests.filter(
		(request) => request.status === 'pending' && request.expiresAt > now,
	)

	const otherRequests = requests.filter(
		(request) => request.status !== 'pending' || request.expiresAt <= now,
	)

	async function handleEnable() {
		setActionLoading(true)
		setMessage(null)

		try {
			const result = await enableEnrollment()

			if (!result) {
				setMessage({
					type: 'error',
					text: 'Failed to enable enrollment. Please try again.',
				})
				return
			}

			await fetchData(true)

			setMessage({
				type: 'success',
				text: 'Device enrollment has been enabled.',
			})
		} catch {
			setMessage({
				type: 'error',
				text: 'Something went wrong while enabling enrollment.',
			})
		} finally {
			setActionLoading(false)
		}
	}

	async function handleDisable() {
		setActionLoading(true)
		setMessage(null)

		try {
			const success = await disableEnrollment()

			if (!success) {
				setMessage({
					type: 'error',
					text: 'Failed to disable enrollment. Please try again.',
				})
				return
			}

			await fetchData(true)

			setMessage({
				type: 'success',
				text: 'Device enrollment has been disabled.',
			})
		} catch {
			setMessage({
				type: 'error',
				text: 'Something went wrong while disabling enrollment.',
			})
		} finally {
			setActionLoading(false)
		}
	}

	async function handleApprove(request: EnrollmentRequest) {
		const applicationId = selectedApplications[request.id]
		const code = codes[request.id]?.trim()

		if (!applicationId) {
			setMessage({
				type: 'error',
				text: 'Please select an application first.',
			})
			return
		}

		if (!code) {
			setMessage({
				type: 'error',
				text: 'Please enter an enrollment code.',
			})
			return
		}

		setActionLoading(true)
		setMessage(null)

		try {
			const device = await approveEnrollment(request.id, applicationId, code)

			if (!device) {
				setMessage({
					type: 'error',
					text: 'Failed to approve enrollment. Check the code and try again.',
				})
				return
			}

			if (device.error) {
				setMessage({
					type: 'error',
					text: device.error.message + '\n Check the code and try again.',
				})
				return
			}

			setExpandedRequest(null)
			setCodes((previous) => {
				const next = { ...previous }
				delete next[request.id]
				return next
			})

			setMessage({
				type: 'success',
				text: `${getDeviceName(request)} has been approved successfully.`,
			})

			await fetchData(true)
			refreshDashboard()
		} catch {
			setMessage({
				type: 'error',
				text: 'Something went wrong while approving the device.',
			})
		} finally {
			setActionLoading(false)
		}
	}

	function copyToClipboard(value: string) {
		void navigator.clipboard.writeText(value)
		setMessage({
			type: 'success',
			text: 'Copied to clipboard.',
		})
	}

	function toggleRequest(id: string) {
		setExpandedRequest((previous) => (previous === id ? null : id))
		setMessage(null)
	}

	return (
		<div className={styles.container}>
			{message && (
				<div
					className={`${styles.toast} ${
						message.type === 'success' ? styles.successMessage : styles.errorMessage
					}`}
					role="alert"
				>
					{message.type === 'success' ? <LuCheck /> : <FiAlertCircle />}

					<span>{message.text}</span>

					<button onClick={() => setMessage(null)} aria-label="Dismiss notification">
						<LuX />
					</button>
				</div>
			)}
			{/* Enrollment status */}

			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<div>
						<h2>Device enrollment</h2>
						<p>Manage incoming device enrollment requests.</p>
					</div>

					<button
						className={styles.iconButton}
						onClick={() => void fetchData(true)}
						disabled={fetching || refreshing}
						title="Refresh"
					>
						<LuRefreshCw className={refreshing ? styles.spinning : ''} />
					</button>
				</div>

				<div className={styles.statusContent}>
					<div className={styles.statusMain}>
						<div
							className={`${styles.statusIcon} ${
								isEnabled ? styles.statusIconEnabled : styles.statusIconDisabled
							}`}
						>
							{isEnabled ? <LuShieldCheck /> : <LuShieldOff />}
						</div>

						<div className={styles.statusInfo}>
							<div className={styles.statusTitle}>
								<h3>Enrollment is {isEnabled ? 'enabled' : 'disabled'}</h3>

								<span
									className={`${styles.statusBadge} ${
										isEnabled ? styles.enabled : styles.disabled
									}`}
								>
									<span />
									{isEnabled ? 'Active' : 'Inactive'}
								</span>
							</div>

							<p>
								{isEnabled
									? 'New devices can currently request access to your Nebula server.'
									: 'New devices cannot request access until you enable enrollment.'}
							</p>

							{isEnabled && enrollmentWindow?.expiresAt && (
								<div className={styles.expiry}>
									<LuCalendarClock />
									<span>Expires on {formatDate(enrollmentWindow.expiresAt)}</span>
									<span className={styles.remaining}>
										{getTimeRemaining(enrollmentWindow.expiresAt)}
									</span>
								</div>
							)}
						</div>
					</div>

					<div className={styles.statusActions}>
						{isEnabled ? (
							<button
								className={styles.dangerButton}
								onClick={handleDisable}
								disabled={actionLoading || fetching}
							>
								{actionLoading ? <LuLoaderCircle className={styles.spinning} /> : <LuX />}
								Disable enrollment
							</button>
						) : (
							<button
								className={styles.primaryButton}
								onClick={handleEnable}
								disabled={actionLoading || fetching}
							>
								{actionLoading ? <LuLoaderCircle className={styles.spinning} /> : <LuShieldCheck />}
								Enable enrollment
							</button>
						)}
					</div>
				</div>
			</section>

			{/* Incoming requests */}

			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<div>
						<h2>Enrollment requests</h2>
						<p>Review and approve devices requesting access.</p>
					</div>

					<span className={styles.requestCount}>{pendingRequests.length} pending</span>
				</div>

				{fetching || loading ? (
					<div className={styles.loading}>
						<LuLoaderCircle className={styles.spinning} />
						<span>Loading enrollment requests...</span>
					</div>
				) : error ? (
					<EmptyState message="Failed to load dashboard data." />
				) : requests.length === 0 ? (
					<EmptyState message="No enrollment requests yet." />
				) : (
					<div className={styles.requestList}>
						{pendingRequests.length > 0 && (
							<div className={styles.requestSection}>
								<div className={styles.sectionLabel}>PENDING REQUESTS</div>

								{pendingRequests.map((request) => {
									const expanded = expandedRequest === request.id

									return (
										<div className={styles.requestCard} key={request.id}>
											<div className={styles.requestHeader}>
												<div className={styles.deviceIcon}>
													{getDeviceIcon(request.info.platform)}
												</div>

												<div className={styles.deviceInfo}>
													<h3>{getDeviceName(request)}</h3>
													<p>
														{request.info.platform || 'Unknown platform'}
														{request.info.os ? ` · ${request.info.os}` : ''}
													</p>
												</div>

												<span className={`${styles.statusBadge} ${styles.pending}`}>
													<span />
													Pending
												</span>

												<button
													className={styles.expandButton}
													onClick={() => toggleRequest(request.id)}
													aria-label={expanded ? 'Collapse request' : 'Expand request'}
												>
													<LuChevronDown className={expanded ? styles.rotated : ''} />
												</button>
											</div>

											<div className={styles.requestMeta}>
												<span>
													<LuClock />
													Requested {formatDate(request.createdAt)}
												</span>

												<span>
													<LuCalendarClock />
													Expires {formatDate(request.expiresAt)}
												</span>
											</div>

											{expanded && (
												<div className={styles.requestDetails}>
													<div className={styles.detailsGrid}>
														<div>
															<label>Request ID</label>
															<div className={styles.copyValue}>
																<code>{request.id}</code>
																<button
																	onClick={() => copyToClipboard(request.id)}
																	title="Copy request ID"
																>
																	<LuCopy />
																</button>
															</div>
														</div>

														<div>
															<label>Device name</label>
															<p>{getDeviceName(request)}</p>
														</div>

														<div>
															<label>Platform</label>
															<p>{request.info.platform || 'Unknown'}</p>
														</div>

														<div>
															<label>Operating system</label>
															<p>{request.info.os || 'Unknown'}</p>
														</div>

														<div>
															<label>OS version</label>
															<p>{request.info.osVersion || 'Unknown'}</p>
														</div>

														<div>
															<label>App version</label>
															<p>{request.info.appVersion || 'Unknown'}</p>
														</div>
													</div>

													<div className={styles.publicKey}>
														<label>Public key</label>
														<div className={styles.copyValue}>
															<code>{request.publicKey}</code>
															<button
																onClick={() => copyToClipboard(request.publicKey)}
																title="Copy public key"
															>
																<LuCopy />
															</button>
														</div>
													</div>

													{/* Approval */}

													<div className={styles.approval}>
														<div className={styles.approvalHeader}>
															<LuKeyRound />
															<h4>Approve device</h4>
														</div>

														{!isEnabled && (
															<div className={styles.warning}>
																<FiAlertCircle />
																Enrollment is disabled. Enable it before approving requests.
															</div>
														)}

														{loading || applications.length === 0 ? (
															<div className={styles.noApplications}>
																<LuPackage />
																<div>
																	<strong>No applications available</strong>
																	<p>Create an application before approving a device.</p>
																</div>
															</div>
														) : (
															<>
																<div className={styles.formGroup}>
																	<label htmlFor={`application-${request.id}`}>
																		Select application
																	</label>

																	<select
																		id={`application-${request.id}`}
																		value={selectedApplications[request.id] || ''}
																		onChange={(event) =>
																			setSelectedApplications((previous) => ({
																				...previous,
																				[request.id]: event.target.value,
																			}))
																		}
																	>
																		<option value="" disabled>
																			Choose an application
																		</option>

																		{applications.map((application) => (
																			<option key={application.id} value={application.id}>
																				{application.name}
																			</option>
																		))}
																	</select>
																</div>

																<div className={styles.formGroup}>
																	<label htmlFor={`code-${request.id}`}>Enrollment code</label>

																	<input
																		id={`code-${request.id}`}
																		type="text"
																		value={codes[request.id] || ''}
																		onChange={(event) =>
																			setCodes((previous) => ({
																				...previous,
																				[request.id]: event.target.value,
																			}))
																		}
																		placeholder="Enter the enrollment code"
																		autoComplete="off"
																	/>
																</div>

																<div className={styles.approvalActions}>
																	<button
																		className={styles.primaryButton}
																		onClick={() => void handleApprove(request)}
																		disabled={
																			actionLoading ||
																			!isEnabled ||
																			!selectedApplications[request.id] ||
																			!codes[request.id]?.trim()
																		}
																	>
																		{actionLoading ? (
																			<LuLoaderCircle className={styles.spinning} />
																		) : (
																			<LuCheck />
																		)}
																		Approve device
																	</button>
																</div>
															</>
														)}
													</div>
												</div>
											)}
										</div>
									)
								})}
							</div>
						)}

						{otherRequests.length > 0 && (
							<div className={styles.requestSection}>
								<div className={styles.sectionLabel}>OTHER REQUESTS</div>

								{otherRequests.map((request) => (
									<div className={styles.historyCard} key={request.id}>
										<div className={styles.deviceIcon}>{getDeviceIcon(request.info.platform)}</div>

										<div className={styles.deviceInfo}>
											<h3>{getDeviceName(request)}</h3>
											<p>
												{request.info.platform || 'Unknown platform'}
												{' · '}
												{formatDate(request.createdAt)}
											</p>
										</div>

										<span
											className={`${styles.statusBadge} ${
												request.status === 'approved'
													? styles.enabled
													: request.status === 'rejected'
														? styles.disabled
														: styles.expired
											}`}
										>
											<span />
											{request.status === 'pending'
												? 'Expired'
												: request.status.charAt(0).toUpperCase() + request.status.slice(1)}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</section>
		</div>
	)
}
