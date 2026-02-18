import { IoMdClose } from 'react-icons/io'

export const Logs: React.FC<{ logs: string[]; onClose: () => void }> = ({
  logs,
  onClose,
}) =>
  logs.length ? (
    <div className="box p-2 max-w-80 relative">
      <div className="font-bold text-center py-1 border-b border-foreground/10">
        Logs
        <IoMdClose
          onClick={onClose}
          className="absolute right-2 top-2 cursor-pointer"
        />
      </div>

      <div className="overflow-scroll text-sm divide-y divide-foreground/10 max-h-32">
        {logs.map((log, index) => (
          <div key={index} className="py-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  ) : null
