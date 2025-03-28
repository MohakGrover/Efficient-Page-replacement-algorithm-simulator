"use client"

import type * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

const SidebarContext = createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  isOpen: true,
  setIsOpen: () => {},
})

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const isMobile = useMobile()

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    } else {
      setIsOpen(defaultOpen)
    }
  }, [isMobile, defaultOpen])

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr]">{children}</div>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const sidebarVariants = cva(
  "group relative flex h-full flex-col overflow-hidden border-r bg-background data-[state=open]:w-72 data-[state=closed]:w-16 transition-all",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-r",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

export function Sidebar({ className, variant, ...props }: SidebarProps) {
  const { isOpen } = useSidebar()

  return (
    <div
      className={cn(sidebarVariants({ variant }), "sticky top-0 h-screen shrink-0", className)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto px-4", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4", className)} {...props} />
}

export function SidebarRail() {
  const { isOpen, setIsOpen } = useSidebar()

  return (
    <div
      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-accent"
      onMouseDown={(e) => {
        e.preventDefault()
        const startX = e.pageX
        const handleMouseMove = (e: MouseEvent) => {
          const width = e.pageX
          if (width < 200) {
            setIsOpen(false)
          } else {
            setIsOpen(true)
          }
        }
        const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove)
          document.removeEventListener("mouseup", handleMouseUp)
        }
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
      }}
    />
  )
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isOpen, setIsOpen } = useSidebar()

  return (
    <button
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M9 3v18" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-screen flex-col", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

export function SidebarMenuButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isOpen } = useSidebar()

  return (
    <button
      className={cn(
        "group flex w-full items-center rounded-md border border-transparent px-3 py-2 hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="mr-2 h-4 w-4 shrink-0">{props.children?.[0]}</span>
      <span
        className={cn(
          "text-sm font-medium text-muted-foreground group-hover:text-accent-foreground",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      >
        {props.children?.[1]}
      </span>
    </button>
  )
}

export function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-4 h-[1px] w-full bg-border", className)} {...props} />
}

