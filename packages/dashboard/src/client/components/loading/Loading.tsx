import styles from './Loading.module.css'

interface LoadingProps {
	message?: string
	fullscreen?: boolean
}

export default function Loading({ message = 'Loading...', fullscreen = false }: LoadingProps) {
	return (
		<div
			className={`${styles.container} ${fullscreen ? styles.fullscreen : ''}`}
			role="status"
			aria-live="polite"
		>
			<div className={styles.spinner} aria-hidden="true">
				<div className={styles.spinnerInner} />
			</div>

			<span className={styles.message}>{message}</span>
		</div>
	)
}
