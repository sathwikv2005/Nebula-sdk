import styles from './ErrorState.module.css'

interface ErrorStateProps {
	message: string
	onRetry: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
	return (
		<div className={styles.error}>
			<span>!</span>
			<p>{message}</p>
			<button onClick={onRetry}>Try again</button>
		</div>
	)
}
