import { useEffect, useRef } from 'react'
import { IoMdClose } from 'react-icons/io'

export const Logs: React.FC<{ logs: string[]; onClose: () => void }> = ({
  logs,
  onClose,
}) => {
  const logsContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!logsContainerRef.current) return

    logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
  }, [logs])

  if (!logs.length) return null

  return (
    <div className="box p-2 max-w-80 relative animate-slide-left">
      <div className="font-bold text-center py-1 border-b border-foreground/10">
        Logs
        <IoMdClose
          onClick={onClose}
          className="absolute right-2 top-2 cursor-pointer"
        />
      </div>

      <div
        ref={logsContainerRef}
        className="overflow-scroll text-sm divide-y divide-foreground/10 max-h-44"
      >
        {logs.map((log, index) => (
          <div key={index} className="py-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}
