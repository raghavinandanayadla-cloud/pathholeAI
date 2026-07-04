# PotholeAI

A civic tech web app that lets **citizens photograph potholes** for instant AI-powered severity analysis, while **city officers** manage and resolve reports from a dedicated dashboard.

---

## 🚀 What It Does

| For Citizens | For Officers |
|---|---|
| Upload a photo of a pothole | View all submitted reports |
| Get an instant AI severity rating (Low / Medium / High / Critical) | Filter reports by severity or status |
| See an AI-generated description of the damage | Update report status (Open → In Progress → Resolved) |

---

## 🛠️ Built With

- **Frontend** — React 18, Vite, Tailwind CSS, shadcn/ui
- **Backend** — Node.js, Express 5
- **Database** — PostgreSQL with Drizzle ORM
- **AI** — Google Gemini 1.5 Flash (Vision)
- **Language** — TypeScript (end-to-end)

---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/raghavinandanayadla-cloud/pathholeAI.git
cd pathholeAI
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Add environment variables

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
DATABASE_URL=your_postgres_connection_string
OFFICER_API_KEY=your_secret_key        # optional — omit to skip auth in dev
```

> Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 4. Set up the database

```bash
pnpm --filter @workspace/db run push
```

### 5. Start the app

```bash
# Start the API server (runs on port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (runs on port 23331)
pnpm --filter @workspace/potholeai run dev
```

---

## 📁 Project Structure

```
pathholeAI/
├── artifacts/
│   ├── api-server/        # Express API + Gemini integration
│   └── potholeai/         # React frontend
├── lib/
│   ├── api-spec/          # OpenAPI spec (source of truth for all API types)
│   ├── db/                # Database schema (Drizzle)
│   ├── api-client-react/  # Auto-generated React Query hooks
│   └── api-zod/           # Auto-generated Zod validation schemas
└── package.json
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports` | Get all reports (filter by status or severity) |
| `POST` | `/api/reports` | Submit a new pothole report with photo |
| `GET` | `/api/reports/:id` | Get a single report |
| `PATCH` | `/api/reports/:id/status` | Update report status *(requires officer token if set)* |
| `GET` | `/api/stats` | Get report counts by severity and status |

---

## 📝 Notes

- If the Gemini API fails, the report is still saved — no submission is ever lost
- The `OFFICER_API_KEY` is optional. If not set, the status update endpoint is open (good for development)
- Do not edit files inside `lib/api-client-react/src/generated/` — they are auto-generated

---

## 👤 Author

**Raghavi Nandana Yadla** — [@raghavinandanayadla-cloud](https://github.com/raghavinandanayadla-cloud)
