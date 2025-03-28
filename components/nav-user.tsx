import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isOpen } = useSidebar()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-full w-full items-center gap-2 p-2 hover:bg-accent">
          <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
            <img className="aspect-square h-full w-full" src={user.avatar || "/placeholder.svg"} alt={user.name} />
          </span>
          <span className={cn("flex w-[160px] flex-col items-start text-sm", isOpen ? "opacity-100" : "opacity-0")}>
            <span className="font-medium leading-none tracking-tight">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

