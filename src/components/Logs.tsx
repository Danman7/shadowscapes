import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { IoMdClose } from 'react-icons/io'

import { QUICK_TRANSITION, SLIDE_LEFT_VARIANTS } from 'src/components/animation'
import { messages } from 'src/i18n'

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
    <motion.div
      variants={SLIDE_LEFT_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={QUICK_TRANSITION}
      className="box z-50 shadow-xl p-2 max-w-80 relative"
    >
      <div className="font-bold py-1">
        {messages.ui.logs}
        <IoMdClose
          onClick={onClose}
          className="absolute right-2 top-2 cursor-pointer"
        />
      </div>

      <div
        ref={logsContainerRef}
        className="overflow-scroll text-sm divide-line max-h-44"
      >
        {logs.map((log, index) => (
          <div key={index} className="py-1">
            {log}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
