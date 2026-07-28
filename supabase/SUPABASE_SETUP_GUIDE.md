# Complete Supabase Deployment & Configuration Guide

This guide details the step-by-step procedure for deploying the **Symphosium Examination Platform** database schema, Row-Level Security (RLS) policies, Storage Buckets, Edge Functions, Auth Providers, and Supabase Realtime channels.

---

## 1. Prerequisites & Environment Variables

Ensure you have installed the **Supabase CLI**:
```bash
npm install -g supabase
```

Create `.env.local` inside your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 2. Step 1: Database Migration Execution

Execute the SQL migration scripts sequentially in the Supabase Dashboard SQL Editor or via Supabase CLI:

```bash
# Initialize local Supabase instance or connect to remote
supabase db push
```

### Schema Files Executed:
1. `supabase/schema.sql` (Creates 19 Core Tables, PKs, FKs, Indexes & Constraints)
2. `supabase/migrations/002_security_rls_triggers_realtime.sql` (Auth triggers, RLS Policies, Storage Buckets & Realtime Publications)

---

## 3. Step 2: Authentication Configuration

### Email / Password Provider Setup
1. In the Supabase Dashboard, navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
2. Enable **Email Provider**.
3. Toggle **Confirm email** (Optional: Set to `Disabled` during dev testing).

### User Signup Trigger
The database automatically executes `public.handle_new_user()` when a candidate signs up via `supabase.auth.signUp()`. This provisions their profile in `public.users` with the default `STUDENT` role.

---

## 4. Step 3: Supabase Storage Buckets

The system automatically configures 3 storage buckets:

| Bucket Name | Access | Purpose |
| :--- | :--- | :--- |
| **`certificate-pdfs`** | Public Read / Admin Write | Host cryptographically verified candidate PDF certificates. |
| **`incident-snapshots`** | Private (Admin Only) | Host proctoring webcam snapshots and violation logs. |
| **`question-assets`** | Public Read | Host code diagrams, question images, and test matrices. |

---

## 5. Step 4: Supabase Realtime Setup

Realtime channels enable instant WebSocket updates across candidate and organizer UI dashboards.

### Published Realtime Tables:
- `leaderboard` (Broadcast rank updates)
- `announcements` (Broadcast organizer announcements)
- `cheating_logs` (Stream live proctoring flags to admin command center)
- `events` (Broadcast live exam status: PAUSE / RESUME / EXTEND)
- `notifications` (Stream candidate disqualification alerts)

---

## 6. Step 5: Deno Edge Functions Deployment

Deploy the serverless Edge Functions for sandbox evaluation, PDF hashing, and anti-cheat anomaly scoring:

```bash
# Log in to Supabase CLI
supabase login

# Deploy Edge Functions
supabase functions deploy evaluate-code
supabase functions deploy generate-certificate
supabase functions deploy anti-cheat-anomaly
```

### Function API Invocation Endpoints:
- `https://<project-ref>.supabase.co/functions/v1/evaluate-code`
- `https://<project-ref>.supabase.co/functions/v1/generate-certificate`
- `https://<project-ref>.supabase.co/functions/v1/anti-cheat-anomaly`

---

## 7. Step 6: Verification & Health Check

Run the following SQL snippet in your Supabase SQL Editor to verify schema integrity:

```sql
SELECT table_name, row_security 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
*Expected Result*: All 19 tables display `row_security = true`.
