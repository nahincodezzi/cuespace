<div align="center">

# 🪐 CueSpace

**Autonomous Timezone-Aware Smart Event & Multi-Channel Notification SaaS Engine**

[![CI Pipeline](https://github.com/nahincodezzi/cuespace/actions/workflows/ci.yml/badge.svg)](https://github.com/nahincodezzi/cuespace/actions)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![SQA Verified](https://img.shields.io/badge/SQA%20Audit-100%25%20Passed-emerald.svg)](./SQA_TEST_REPORT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*Never miss a moment. An ultra-reliable event tracking engine with sub-second timezone accuracy, astronomical calendar conversion, stateless cryptographic 1-click snooze, and a Linear/Vercel-inspired cosmic dark design system.*

[Explore Features](#-core-features) • [Quickstart](#-quickstart-guide) • [Architecture](#-system-architecture) • [API Specs](#-rest-api-endpoints) • [User Guide](./USER_GUIDE.md)

</div>

---

## ⚡ Overview

**CueSpace** is a production-grade SaaS platform built to solve the hardest problems in recurring notifications:
1. **Timezone Volatility & DST:** Automatically adapts to Daylight Saving Time changes across global IANA timezones (e.g., UTC+6 Dhaka, UTC-4 New York, UTC+1 London BST).
2. **Leap Year Precision:** Gracefully handles February 29 leap year anniversaries with user-configurable policies (`FEB_28`, `MARCH_1`, or `EXACT_ONLY`).
3. **Astronomical & Regional Calendars:** Native mathematical conversion for **Hijri Lunar** (lunar drift calculations) and **Bengali Solar** (revised national calendar).
4. **Stateless 1-Click Snooze:** Cryptographic HMAC-SHA256 tokens enable instant 3-hour or 1-day snooze directly from emails without requiring user authentication.
5. **Linear/Raycast Design System:** Cosmic dark theme (`#08080d`), 360-degree Live Timezone Radar sweep, and an instant Command Palette (`Cmd+K`).

---

## 🏗️ System Architecture

```
                                  +------------------------------------+
                                  |         Next.js 16 App             |
                                  |  (Turbopack + Tailwind + Lucide)   |
                                  +-----------------+------------------+
                                                    |
                                       REST / JSON  |  HTTP (Axios / Fetch)
                                                    v
+-----------------------+         +-----------------+------------------+
|   Celery Beat (60s)   | ------> |      FastAPI Async Backend         |
|   (Scheduler Tick)    |         | (Python 3.12 + SQLAlchemy 2.0 ORM) |
+-----------+-----------+         +--------+------------------+--------+
            |                              |                  |
            | Redlock Mutex                | aiosqlite /      | HMAC-SHA256
            v                              | asyncpg          | Token Signer
+-----------+-----------+                  v                  v
|      Redis 7.0        |         +--------+-------+  +-------+--------+
| (Queue & Mutex Lock)  |         |   PostgreSQL / |  | 1-Click Snooze |
+-----------+-----------+         | SQLite Engine  |  |  Email Handler |
            |                     +----------------+  +----------------+
            v
+-----------+-----------+
|  Celery Async Worker  | ------> [Resend API (Email)] + [Twilio (WhatsApp & SMS)]
+-----------------------+
```

---

## 🌟 Core Features

| Feature | Description |
| :--- | :--- |
| 🌐 **Live Timezone Radar** | 360-degree rotating radar inspecting live ticking clocks in Dhaka, New York, London, Dubai & Tokyo with zone event filtering. |
| ⌨️ **Command Palette (`Cmd+K`)** | Raycast/Linear-style global command bar for instant search, quick navigation, and event creation. |
| 🔒 **Stateless HMAC Snooze** | Cryptographically signed links allowing recipients to snooze reminders directly from their email inbox without passwords. |
| 🌙 **Multi-Calendar Engine** | Gregorian, Hijri Lunar (astronomical shift), and Bengali Solar (Pohela Boishakh = April 14). |
| 🛡️ **Enterprise Admin CMS** | Dedicated admin portal (`/admin`) for live landing page text editing, feature cards CRUD, event database management, and delivery audit logs. |
| 📱 **Multi-Channel Dispatch** | Simultaneous dispatch to Email (Resend), WhatsApp (Twilio), and SMS. |
| 📅 **Calendar Sync & Export** | Dynamic 1-click `.ics` file generation and phone contact import. |

---

## 🚀 Quickstart Guide

### Option A: 1-Command Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/nahincodezzi/cuespace.git
cd cuespace

# Start all services (Backend, Frontend, Redis, Celery Worker, Celery Beat)
docker compose up -d
```

* **Frontend Application:** `http://localhost:3000`
* **Admin CMS Portal:** `http://localhost:3000/admin`
* **Backend API & Swagger Docs:** `http://localhost:8000/docs`

---

### Option B: Local Development Setup

#### 1. Backend Setup (FastAPI)
```bash
# Set up virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --port 8000 --reload
```

#### 2. Frontend Setup (Next.js 16)
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

#### 3. Run Automated SQA Test Suite
```bash
python -m unittest tests/test_sqa_suite.py -v
```
*(All 15 automated test cases execute with 100% assertions in < 1.0 second).*

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/health` | Service health status and environment check. |
| `POST` | `/api/v1/events/` | Create a new smart event with timezone calculation. |
| `GET` | `/api/v1/events/` | List all tracked events for current user. |
| `GET` | `/api/v1/events/{id}` | Retrieve details of a single event. |
| `PUT` | `/api/v1/events/{id}` | Update event parameters and recalculate `next_trigger_at`. |
| `DELETE` | `/api/v1/events/{id}` | Permanently delete an event. |
| `GET` | `/api/v1/events/snooze?token=...` | Stateless 1-click snooze handler from email. |
| `POST` | `/api/v1/events/{id}/dispatch-now` | Immediate test notification dispatch and audit logging. |
| `GET` | `/api/v1/events/audit/logs` | Fetch multi-channel notification dispatch logs. |

---

## 🔐 Admin Portal Credentials

* **URL:** `http://localhost:3000/admin`
* **Default Admin Email:** `admin@cuespace.app`
* **Default Password:** `admin123`

---

## 📜 Quality Assurance & Verification

The project is backed by a comprehensive SQA Test Suite in [`tests/test_sqa_suite.py`](./tests/test_sqa_suite.py) and formal audit report in [`SQA_TEST_REPORT.md`](./SQA_TEST_REPORT.md).

* **Test Pass Rate:** **100% (15/15 Passed)**
* **TypeScript Compilation:** **0 Errors (`tsc --noEmit` verified)**
* **Audit Document:** [SQA_TEST_REPORT.md](./SQA_TEST_REPORT.md)
* **User Manual (বাংলা):** [USER_GUIDE.md](./USER_GUIDE.md)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with ❤️ by the **CueSpace Team**.
