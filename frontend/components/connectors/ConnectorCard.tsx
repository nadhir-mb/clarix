"use client"

import { Connector } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, Webhook } from "lucide-react"
import { toast } from "sonner"

interface Props {
  connector: Connector
  onDelete: (id: string) => void
}

export function ConnectorCard({ connector, onDelete }: Props) {
  const webhookUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/webhook/${connector.id}`

  function copyUrl() {
    navigator.clipboard.writeText(webhookUrl)
    toast.success("Webhook URL copied")
  }

  return (
    <Card className="border-zinc-200">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-blue-500" />
            <p className="font-medium text-sm">{connector.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-red-500"
            onClick={() => onDelete(connector.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        <p className="text-xs text-zinc-500">Webhook URL — send POST requests here</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-zinc-50 border rounded px-2 py-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-zinc-600">
            {webhookUrl}
          </code>
          <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={copyUrl}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-zinc-400">
          Created {new Date(connector.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
