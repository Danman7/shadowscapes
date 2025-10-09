export interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className="border-2 border-b-4 border-line rounded-sm py-1 px-2 cursor-pointer bg-surface shadow-sm hover:shadow-md active:border-b-2 active:shadow-xs hover:border-b-8 focus:outline-2 focus:outline-offset-2 focus:outline-line transition"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
