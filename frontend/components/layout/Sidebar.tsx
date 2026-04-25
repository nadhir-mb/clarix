"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  LayoutList,
  Plug,
  Settings,
  LogOut,
  Activity,
} from "lucide-react"
import { toast } from "sonner"

const nav = [
  { href: "/feed", label: "Decision Feed", icon: LayoutList },
  { href: "/connectors", label: "Connectors", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-white px-3 py-5">
      <div className="flex items-center gap-2 px-2 mb-8">
        <Activity className="h-5 w-5 text-blue-600" />
        <span className="font-bold text-lg tracking-tight">Clarix</span>
      </div>

      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  )
}
