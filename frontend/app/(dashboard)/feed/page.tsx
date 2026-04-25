"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Decision } from "@/lib/types"
import { DecisionCard } from "@/components/decisions/DecisionCard"
import { DecisionDetail } from "@/components/decisions/DecisionDetail"
import { Button } from "@/components/ui/button"
import { Plug, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function FeedPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [selected, setSelected] = useState<Decision | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("decisions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
    setDecisions(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Decision Feed</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            All decisions flowing through your connected sources
          </p>
        </div>
        <button
          onClick={load}
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-zinc-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && decisions.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          <Plug className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-zinc-600">No decisions yet</p>
          <p className="text-sm mt-1">Connect a data source to start seeing decisions here</p>
          <Link href="/connectors">
            <Button className="mt-4" variant="outline" size="sm">
              Set up a connector
            </Button>
          </Link>
        </div>
      )}

      {!loading && decisions.length > 0 && (
        <div className="space-y-3">
          {decisions.map((d) => (
            <DecisionCard key={d.id} decision={d} onClick={() => setSelected(d)} />
          ))}
        </div>
      )}

      <DecisionDetail decision={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
