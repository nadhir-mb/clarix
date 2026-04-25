"use client"

import { Decision } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "@/lib/utils"

const statusConfig: Record<string, { label: string; class: string }> = {
  approved: { label: "Approved", class: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", class: "bg-red-100 text-red-800" },
  pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
  flagged: { label: "Flagged", class: "bg-orange-100 text-orange-800" },
}

const categoryLabels: Record<string, string> = {
  loan: "Loan",
  compliance: "Compliance",
  transaction: "Transaction",
  risk: "Risk",
  kyc: "KYC",
  other: "Other",
}

interface Props {
  decision: Decision
  onClick: () => void
}

export function DecisionCard({ decision, onClick }: Props) {
  const status = statusConfig[decision.status] ?? { label: decision.status, class: "" }

  return (
    <Card
      className="cursor-pointer hover:shadow-sm transition-shadow border-zinc-200"
      onClick={onClick}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm leading-snug">{decision.title}</p>
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              status.class
            )}
          >
            {status.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {decision.ai_summary && (
          <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{decision.ai_summary}</p>
        )}
        {!decision.ai_summary && decision.description && (
          <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{decision.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[decision.category] ?? decision.category}
          </Badge>
          {decision.amount != null && (
            <span className="text-xs text-zinc-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: decision.currency ?? "USD",
                maximumFractionDigits: 0,
              }).format(decision.amount)}
            </span>
          )}
          <span className="text-xs text-zinc-400 ml-auto">
            {formatDistanceToNow(new Date(decision.created_at))}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
