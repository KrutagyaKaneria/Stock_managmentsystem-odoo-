import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  onClose: () => void
}

export function Toast({ id, title, description, variant = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        {
          "border-gray-200 bg-white": variant === "default",
          "border-red-200 bg-red-50": variant === "destructive",
          "border-green-200 bg-green-50": variant === "success",
        }
      )}
    >
      <div className="grid gap-1">
        {title && (
          <div
            className={cn("text-sm font-semibold", {
              "text-gray-900": variant === "default",
              "text-red-900": variant === "destructive",
              "text-green-900": variant === "success",
            })}
          >
            {title}
          </div>
        )}
        {description && (
          <div
            className={cn("text-sm opacity-90", {
              "text-gray-500": variant === "default",
              "text-red-700": variant === "destructive",
              "text-green-700": variant === "success",
            })}
          >
            {description}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn("absolute right-2 top-2 h-6 w-6", {
          "text-gray-500 hover:text-gray-900": variant === "default",
          "text-red-500 hover:text-red-900": variant === "destructive",
          "text-green-500 hover:text-green-900": variant === "success",
        })}
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

