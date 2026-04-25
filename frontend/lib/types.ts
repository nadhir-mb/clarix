export type DecisionStatus = "approved" | "rejected" | "pending" | "flagged"
export type DecisionCategory =
  | "loan"
  | "compliance"
  | "transaction"
  | "risk"
  | "kyc"
  | "other"

export interface Decision {
  id: string
  user_id: string
  connector_id: string | null
  title: string
  description: string | null
  status: DecisionStatus
  category: DecisionCategory
  amount: number | null
  currency: string | null
  ai_summary: string | null
  raw_payload: Record<string, unknown>
  created_at: string
}

export interface Connector {
  id: string
  user_id: string
  name: string
  type: "webhook"
  webhook_secret: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  organization: string | null
  created_at: string
}
