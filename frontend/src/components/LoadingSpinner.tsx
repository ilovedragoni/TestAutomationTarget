interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return <span className={`loading-spinner ${size} ${className}`.trim()} aria-hidden="true" />;
}
