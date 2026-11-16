# CueSpace: Enterprise System Architecture & UI/UX Design System
*Smart Event & Timezone-Aware Notification Engine*

---

## 1. Complete System Architecture & Background Worker Mechanics

### 1.1 Architecture Interaction Flow
CueSpace decouples synchronous client requests from asynchronous, timezone-heavy cron operations.

1. **Client Tier (Next.js 14 / Edge)**:
   - The user creates/edits an event or clicks an actionable email button (e.g., 1-Click Snooze for 3h/1d).
   - Client sends authenticated REST requests to the FastAPI Gateway.

2. **API Tier (FastAPI Async)**:
   - Validates event payload (date, time, timezone, recurrence rule, leap-year handling).
   - Calls `RecurrenceEngine` to calculate the exact UTC timestamp for the next notification: `next_trigger_at`.
   - Persists the record into PostgreSQL within an ACID transaction.
   - Returns the created event immediately to the client in `<20ms`.

3. **Scheduler Tier (Celery Beat + Redis Distributed Lock)**:
   - **Heartbeat**: Every 60 seconds, Celery Beat emits the `scan_and_dispatch_notifications` task.
   - **Distributed Redlock**: To prevent race conditions in horizontal multi-replica deployments, the dispatcher acquires an atomic key in Redis (`cuespace:lock:scheduler_tick`, TTL = 50s). If another replica holds the lock, execution gracefully skips.
   - **PostgreSQL Row Fetching with `FOR UPDATE SKIP LOCKED`**:
     ```sql
     SELECT * FROM events
     WHERE is_active = true
       AND next_trigger_at <= NOW()
     ORDER BY next_trigger_at ASC
     FOR UPDATE SKIP LOCKED;
     ```
     This allows horizontal worker scaling where multiple worker threads can process distinct event chunks concurrently without double-dispatch.

4. **Queue & Worker Dispatch Tier (Celery Worker Queues)**:
   - For every event due, Celery fans out subtasks into dedicated broker queues:
     - `notifications_email` -> Resend API worker
     - `notifications_sms` -> Twilio SMS worker
     - `notifications_whatsapp` -> Twilio WhatsApp worker
   - The scheduler advances `last_triggered_at = NOW()` and recalculates the subsequent `next_trigger_at` (or deactivates one-off events).

5. **Stateless 1-Click Actionable Snooze (HMAC Signed Links)**:
   - When an email reminder is delivered, it contains direct action URLs:
     `https://api.cuespace.app/api/v1/events/snooze?token=<base64_payload>.<hmac_sha256>`
   - The token contains `{ "event_id": "...", "snooze_hours": 3, "exp": 1740000000 }` signed with the server's `SECRET_KEY`.
   - Clicking this URL requires **zero login**; FastAPI verifies the cryptographic signature, checks expiration, increments `event.next_trigger_at = NOW() + 3 hours`, writes an audit log in `notification_logs`, and renders an immediate feedback page.

---

### 1.2 Timezone Math & Recurrence Algorithm

#### A. Timezone Wall-Clock Translation
Users specify reminders in their local wall-clock time (e.g., `09:00 AM America/New_York` or `Asia/Dhaka`).
```
Target UTC Trigger = (EventDate - AlertLeadDays) + ReminderTime (localized to User's IANA Timezone) converted to UTC
```
- Handles Daylight Saving Time (DST) transitions using standard IANA tz database definitions via `pytz` / `zoneinfo`.
- Resolves ambiguous (fold) and non-existent spring-forward hours cleanly.

#### B. Leap Year Strategy (Feb 29 Anniversaries)
When an event starts on `February 29` (e.g., 1996-02-29):
- **`FEB_28` (Default)**: During non-leap years, trigger on February 28.
- **`MARCH_1`**: During non-leap years, trigger on March 1.
- **`EXACT_ONLY`**: Trigger only in leap years (every 4 years).

#### C. Regional Calendars (Hijri & Bengali)
- **Hijri (Islamic Lunar Calendar)**:
  Uses the Umm al-Qura astronomical algorithm (`hijri-converter`). Converts the anchor Gregorian date to Hijri year, month, and day. Each subsequent cycle computes the next Hijri anniversary date and converts it back to the corresponding Gregorian date in the current solar year.
- **Bengali (Bangla Solar Calendar)**:
  Synchronized with the revised solar calendar (Pohela Boishakh = April 14). Months 1–6 have 31 days; months 7–11 have 30 days; month 12 (Falgun) has 29 or 30 days.

---

## 2. Complete Database Schema (PostgreSQL)

- **`users`**: User identity, timezone, phone, OAuth credentials.
- **`tags`**: Color-coded category tags (Family, Work, Finance, Health) scoped per user.
- **`events`**: Core events table with composite B-Tree indexes on `(is_active, next_trigger_at)` for sub-millisecond cron queries.
- **`event_tags`**: Many-to-many relationship mapping between events and tags.
- **`notification_logs`**: Immutable audit logs of every email, SMS, and WhatsApp dispatch, tracking provider IDs (Resend/Twilio), errors, and snooze events.

---

## 3. UI/UX Design System (Linear / Vercel / Stripe Aesthetic)

### 3.1 Color Palette (Dark-Mode First & High-Contrast Light Mode)

| Token | Dark Mode Hex | Light Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Background (Canvas)** | `#090A0F` | `#FBFBFC` | Deep void background, zero pure black |
| **Surface (Card / Modal)** | `#111318` | `#FFFFFF` | Elevated cards, slide-over drawer backgrounds |
| **Surface Border** | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | Ultra-subtle 1px glassmorphism border |
| **Primary Brand** | `#6366F1` | `#4F46E5` | Linear electric indigo (accent & active tabs) |
| **Primary Glow** | `rgba(99,102,241,0.15)` | `rgba(79,70,229,0.1)` | Subtle focus rings and badge fills |
| **Text Primary** | `#EDEDED` | `#0A0D14` | High contrast headings and titles |
| **Text Secondary** | `#A1A1AA` | `#52525B` | Subtext, timestamps, timezone badges |
| **Text Muted** | `#52525B` | `#A1A1AA` | Disabled states, table header labels |

#### Category Tag Accents:
- **Family**: `#EC4899` (Rose 500)
- **Work**: `#3B82F6` (Blue 500)
- **Finance**: `#10B981` (Emerald 500)
- **Health**: `#F59E0B` (Amber 500)
- **Urgent / Deadline**: `#EF4444` (Red 500)

### 3.2 Typography & Spacing
- **Font Family**: `Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`
- **Tabular Numerals**: `font-mono tabular-nums` for countdowns and time badges (`09:00 AM`, `in 3 days`).
- **Borders**: Strictly `border-[1px]` with semi-transparent alphas (`border-white/[0.08]`).

### 3.3 Shadcn UI Component Inventory

1. **`Sheet` (Slide-over Drawer)**:
   - Primary interaction pattern for adding and editing events.
   - Glides smoothly from the right with keyboard shortcut `Cmd+K` or `C`.
2. **`Calendar` & `Popover`**:
   - Date picker with calendar type switcher (Gregorian / Hijri / Bengali) and leap year indicator.
3. **`Command` (Cmd+K Palette)**:
   - Instant search across all upcoming birthdays, tags, and contacts.
4. **`Badge`**:
   - Subtle tinted background (`bg-indigo-500/10 text-indigo-400 border-indigo-500/20`) for tags and channels.
5. **`ToggleGroup` & `Tabs`**:
   - Switch between **Timeline View** (chronological countdown) and **Masonry Grid View** (grouped by month/tag).
6. **`DropdownMenu`**:
   - Quick event actions: "Snooze 3h", "Snooze 1d", "Export .ics", "Duplicate", "Delete".
7. **`AlertDialog`**:
   - Safe confirmation for event deletions or bulk contact uploads.
