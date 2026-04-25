"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Connector } from "@/lib/types"
import { ConnectorCard } from "@/components/connectors/ConnectorCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from("connectors")
      .select("*")
      .order("created_at", { ascending: false })
    setConnectors(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function createConnector(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const secret = crypto.randomUUID()
    const { error } = await supabase.from("connectors").insert({
      user_id: user.id,
      name: name.trim(),
      type: "webhook",
      webhook_secret: secret,
    })

    if (error) {
      toast.error("Failed to create connector")
    } else {
      toast.success("Connector created")
      setName("")
      setShowForm(false)
      load()
    }
    setCreating(false)
  }

  async function deleteConnector(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("connectors").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete connector")
    } else {
      toast.success("Connector deleted")
      setConnectors((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Connectors</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Connect your data sources to start ingesting decisions
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New connector
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-blue-100 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Add webhook connector</CardTitle>
            <CardDescription>
              We'll give you a URL. Send POST requests with decision events to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createConnector} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="connName">Connector name</Label>
                <Input
                  id="connName"
                  placeholder="e.g. Loan Engine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {connectors.length === 0 && !showForm && (
        <div className="text-center py-16 text-zinc-400">
          <p className="font-medium text-zinc-600">No connectors yet</p>
          <p className="text-sm mt-1">Create one to start sending decisions to Clarix</p>
        </div>
      )}

      <div className="space-y-3">
        {connectors.map((c) => (
          <ConnectorCard key={c.id} connector={c} onDelete={deleteConnector} />
        ))}
      </div>
    </div>
  )
}
