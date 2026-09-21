# SSP PROPERTIES & LOANS
### Enterprise SaaS Platform for Real Estate, Loan Portfolio & Vehicle Repo Management

**SSP PROPERTIES & LOANS** is a complete, production-ready enterprise operating system built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS. It connects Property Management, Loan Sanctioning & EMI Amortization, Customer KYC 360°, Vehicle & Repo Recovery Management, Printable Payment Receipts, and Multi-Role RBAC into a single unified platform.

---

## 🗄️ Database Architecture & Supabase Connection

The platform supports dual database modes out-of-the-box:

1. **Local Relational JSON Engine (Default)**:
   - Self-contained in `data/ssp_database.json` with atomic file locks and ACID safety.
   - Pre-seeded with 22 customers, 17 properties, 22 loans, 32 payments, 17 vehicles, 10 agents, and 22 documents.

2. **Supabase Cloud Database (PostgreSQL)**:
   - Connect any Supabase project with zero downtime.
   - Full 13-table relational schema defined in `schema.sql`.

### Quick Setup: Connecting Supabase

#### Option A: In-App Database Manager (Recommended)
1. Open the platform at [http://localhost:3000/settings](http://localhost:3000/settings).
2. Scroll to **Database Engine & Cloud Sync**.
3. Click **Copy SQL Schema** and execute it in your [Supabase SQL Editor](https://supabase.com/dashboard).
4. Enter your **Supabase Project URL** and **Anon / Public API Key**.
5. Click **Test Connection**, then click **Save Configuration** and **Sync Schema & Demo Records**.

#### Option B: Environment Variables (.env.local)
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # (Optional, for admin DDL operations)
```

Run CLI sync:
```bash
npx tsx scripts/sync_to_supabase.ts
```

---

## 🚀 Key Modules & Capabilities

- **Executive Analytics Dashboard**: Real-time KPI summaries, monthly financial charts, repo status pipeline, and live audit feed.
- **Properties Portfolio**: Filters by status (Available, Sold, Rented, Reserved), property types, amenities, and branded PDF brochure export.
- **Loan Management & EMI Engine**: Complete amortization engine, monthly payment schedules, overdue tracking, and interactive financial calculator.
- **Vehicle & Repo Recovery Hub**: 8 reference sections, RTO Vahan vehicle spec lookup, NPCI FASTag toll tracking, pre/post police intimation generation, and repo yard workflow.
- **Customer 360° Directory**: Full KYC verification status, Aadhaar/PAN tracking, credit profile, linked loans, and direct WhatsApp communication.
- **Payment Collection & Receipts**: Live payment recording, transaction ID reconciliation, and branded printable receipts with QR verification.
- **Agent Field Operations**: Case assignment, performance ratings, and portfolio drill-down.
- **Document Management**: Centralized repository with category filtering and instant preview.
- **Executive Reports & Data Export**: 8 comprehensive reports with 1-click export to PDF, Excel (`.xlsx`), and CSV.
- **RBAC Security**: Granular 4-tier roles (`ADMIN`, `MANAGER`, `AGENT`, `STAFF`) with instant role switcher.

---

## 🛠️ Developer Verification & Tests

```bash
# Run Next.js Development Server
npm run dev

# Run Automated Workflow Integration Test Suite
npx tsx scripts/verify_app.ts

# Production Build
npm run build
```

