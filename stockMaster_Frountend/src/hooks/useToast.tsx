import { useState, useCallback } from "react"
import { ToastContainer, ToastProps } from "@/components/ui/toast"

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(
    (props: Omit<ToastProps, "id" | "onClose">) => {
      const id = Math.random().toString(36).substring(7)
      const newToast: ToastProps = {
        ...props,
        id,
        onClose: () => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        },
      }
      setToasts((prev) => [...prev, newToast])
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  const ToastProvider = () => <ToastContainer toasts={toasts} />

  return { toast, ToastProvider }
}

