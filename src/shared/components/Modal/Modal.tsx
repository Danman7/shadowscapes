import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'

import { messages } from '../../../l10n/en'

export interface ModalProps {
  title: ReactNode
  children: ReactNode
  className?: string
  closeLabel?: string
  onCancel?: () => void
}

export const Modal = ({
  title,
  children,
  className = '',
  closeLabel = messages.ui.closeLabel,
  onCancel,
}: ModalProps) => {
  const titleId = useId()

  useEffect(() => {
    if (!onCancel) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={`paper max-h-[90vh] w-full max-w-5xl overflow-hidden p-4 ${className}`}
        role="dialog"
      >
        <header className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-primary" id={titleId}>
            {title}
          </h2>

          {onCancel && (
            <button
              aria-label={closeLabel}
              className="grid size-9 cursor-pointer place-items-center rounded border border-line text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={onCancel}
              type="button"
            >
              <IoClose aria-hidden="true" className="size-6" />
            </button>
          )}
        </header>

        <div className="max-h-[calc(90vh-5.5rem)] overflow-auto">
          {children}
        </div>
      </section>
    </div>
  )
}
