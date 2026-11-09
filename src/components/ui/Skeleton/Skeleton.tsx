import './Skeleton.css'

interface Props {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className = '', width, height }: Props) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
