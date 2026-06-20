type CardProps = {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return <section className={`rounded-3xl bg-white/90 p-6 shadow-soft ${className}`}>{children}</section>
}
