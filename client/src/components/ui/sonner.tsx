"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={false}
      closeButton
      richColors
      duration={4000}
      style={
        {
          "--normal-bg": "#1F2937",
          "--normal-text": "#F9FAFB", 
          "--normal-border": "#374151",
          "--success-bg": "#065F46",
          "--success-text": "#ECFDF5",
          "--success-border": "#10B981",
          "--error-bg": "#7F1D1D",
          "--error-border": "#EF4444",
          "--error-text": "#FEE2E2",
          "--toast-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)",
          "--toast-radius": "0.5rem"
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
