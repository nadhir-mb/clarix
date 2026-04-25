# Clarix

Clarix is an observability tool for business users in banking — helping teams understand and track decisions being made across their organization, in a clear and friendly interface.

---

## What is Clarix?

Banking teams make thousands of decisions every day — loan approvals, risk flags, compliance checks, transaction reviews. Clarix gives business users a simple feed to see those decisions, understand what drove them, and spot anomalies — without needing to be a data engineer.

**MVP goal:** A user can sign up, connect a data source, and start seeing their decisions in a feed.

---

## Tech Stack

| Layer      | Tool                          |
|------------|-------------------------------|
| Frontend   | Next.js (App Router)          |
| Auth + DB  | Supabase                      |
| Hosting    | Vercel                        |
| Source control | GitHub                    |
| AI         | Claude API (Anthropic)        |

---

## Project Structure

```
clarix/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/        # Sign in page
│   │   │   └── signup/       # Create account page
│   │   ├── (dashboard)/
│   │   │   ├── feed/         # Decision feed — main screen after login
│   │   │   ├── connectors/   # Connect a data source
│   │   │   └── settings/     # Account settings
│   │   ├── layout.tsx
│   │   └── page.tsx          # Landing / redirect to login
│   ├── components/
│   │   ├── decisions/        # DecisionCard, DecisionFeed, DecisionDetail
│   │   ├── connectors/       # ConnectorCard, ConnectorSetup
│   │   └── ui/               # shadcn/ui base components
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client + auth helpers
│   │   └── api.ts            # Internal API helpers
│   └── middleware.ts         # Route protection (auth guard)
│
├── backend/                  # FastAPI — lightweight API layer
│   ├── app/
│   │   ├── main.py           # Entry point, routers
│   │   ├── config.py         # Env vars
│   │   ├── routers/
│   │   │   ├── decisions.py  # GET/POST /api/v1/decisions
│   │   │   ├── connectors.py # CRUD /api/v1/connectors
│   │   │   └── auth.py       # JWT verification
│   │   ├── services/
│   │   │   ├── ingestion.py  # Decision event ingestion
│   │   │   ├── ai.py         # Claude API wrapper
│   │   │   └── connectors/
│   │   │       └── webhook.py  # Webhook ingestion (MVP connector)
│   │   └── models/
│   │       ├── decision.py
│   │       └── connector.py
│   └── requirements.txt
│
├── data/
│   └── seed/                 # Mock decisions + users for local dev/demo
│
├── .env.example
└── README.md
```

---

## MVP User Flow

1. User lands on Clarix and creates an account (Supabase Auth)
2. User is taken to their **decision feed** (empty state with prompt to connect)
3. User connects a data source via **webhook** (paste a URL, send events)
4. Decisions start appearing in the feed — each with a summary and category
5. User can click into a decision to see detail and AI-generated explanation

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project (free tier works)

### Frontend

```bash
cd frontend
cp ../.env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload
```

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## Deployment

- **Frontend** → deploy to [Vercel](https://vercel.com), connect the GitHub repo, set env vars in project settings
- **Backend** → deploy to Vercel serverless functions or a lightweight platform (Railway, Render) — Docker support coming later
- **Database** → Supabase handles this; run migrations via Supabase CLI or the dashboard

---

## Status

Early MVP — actively building. Contributions welcome via PRs on GitHub.
