type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled }: ButtonProps) {
  const className =
    variant === 'primary'
      ? 'bg-ink text-white hover:bg-slate-800'
      : variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50'

  return (
    <button
      className={`${className} rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}
