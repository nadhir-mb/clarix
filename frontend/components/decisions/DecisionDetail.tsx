"use client"

import { Decision } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; class: string }> = {
  approved: { label: "Approved", class: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", class: "bg-red-100 text-red-800" },
  pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
  flagged: { label: "Flagged", class: "bg-orange-100 text-orange-800" },
}

interface Props {
  decision: Decision | null
  onClose: () => void
}

export function DecisionDetail({ decision, onClose }: Props) {
  if (!decision) return null
  const status = statusConfig[decision.status] ?? { label: decision.status, class: "" }

  return (
    <Dialog open={!!decision} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug">{decision.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                status.class
              )}
            >
              {status.label}
            </span>
            <Badge variant="secondary" className="text-xs capitalize">
              {decision.category}
            </Badge>
            {decision.amount != null && (
              <span className="text-sm font-medium text-zinc-700">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: decision.currency ?? "USD",
                }).format(decision.amount)}
              </span>
            )}
          </div>

          {decision.ai_summary && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">AI Summary</p>
              <p className="text-sm text-blue-900">{decision.ai_summary}</p>
            </div>
          )}

          {decision.description && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-1">Description</p>
              <p className="text-sm text-zinc-700">{decision.description}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-1">Raw Payload</p>
            <pre className="text-xs bg-zinc-50 border rounded-md p-3 overflow-x-auto text-zinc-600">
              {JSON.stringify(decision.raw_payload, null, 2)}
            </pre>
          </div>

          <p className="text-xs text-zinc-400">
            {new Date(decision.created_at).toLocaleString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
