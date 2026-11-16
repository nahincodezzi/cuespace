from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.models.base import Base
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    if settings.DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Timezone-Aware Smart Event & Notification Engine (Linear / Vercel Aesthetic)",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url=None,  # We serve a customized, CDN-resilient Swagger UI at /docs below
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """
    Robust Swagger UI with multiple CDN fallbacks (cdnjs + unpkg)
    and Linear-style Dark Theme so it NEVER shows a blank white page.
    """
    return HTMLResponse(
        content="""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CueSpace — API Docs</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #090A0F;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .swagger-ui {
                    filter: invert(88%) hue-rotate(180deg);
                }
                .swagger-ui .topbar { display: none; }
                .swagger-ui .wrapper { max-width: 1100px; margin: 0 auto; padding: 24px; }
                .header-bar {
                    background: #111318;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    padding: 16px 28px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .header-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #FAFAFA;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .badge {
                    background: rgba(99,102,241,0.15);
                    color: #818CF8;
                    border: 1px solid rgba(99,102,241,0.3);
                    font-size: 11px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 9999px;
                }
                .nav-links a {
                    color: #A1A1AA;
                    text-decoration: none;
                    font-size: 13px;
                    margin-left: 16px;
                    transition: color 0.2s;
                }
                .nav-links a:hover { color: #FFFFFF; }
            </style>
        </head>
        <body>
            <div class="header-bar">
                <div class="header-title">
                    <span>CueSpace API</span>
                    <span class="badge">v1.0.0 Online</span>
                </div>
                <div class="nav-links">
                    <a href="/">Live Dashboard</a>
                    <a href="/redoc">ReDoc Alternative</a>
                    <a href="/openapi.json" target="_blank">JSON Spec</a>
                </div>
            </div>
            <div id="swagger-ui"></div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
            <script>
                window.onload = function() {
                    window.ui = SwaggerUIBundle({
                        url: '/openapi.json',
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [
                            SwaggerUIBundle.presets.apis,
                            SwaggerUIStandalonePreset
                        ],
                        layout: "BaseLayout"
                    });
                };
            </script>
        </body>
        </html>
        """
    )


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def home_dashboard():
    """
    Sleek Linear/Vercel-inspired Live Dashboard directly at http://localhost:8000/
    Allows the user to view, test, and add events immediately without any blank screen.
    """
    return HTMLResponse(
        content="""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CueSpace — Smart Event & Notification Engine</title>
            <style>
                :root {
                    --bg: #090A0F;
                    --surface: #111318;
                    --surface-hover: #181B22;
                    --border: rgba(255, 255, 255, 0.08);
                    --primary: #6366F1;
                    --text: #EDEDED;
                    --text-muted: #A1A1AA;
                    --accent-green: #10B981;
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    background-color: var(--bg);
                    color: var(--text);
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    padding: 32px 20px;
                    display: flex;
                    justify-content: center;
                }
                .container {
                    width: 100%;
                    max-width: 860px;
                }
                header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-bottom: 24px;
                    border-bottom: 1px solid var(--border);
                    margin-bottom: 32px;
                }
                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .logo {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: white;
                }
                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--accent-green);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                    padding: 4px 10px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .dot { width: 6px; height: 6px; background: var(--accent-green); border-radius: 50%; }
                .nav-buttons a {
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 13px;
                    margin-left: 16px;
                    transition: color 0.2s;
                }
                .nav-buttons a:hover { color: var(--text); }
                .hero {
                    margin-bottom: 32px;
                }
                .hero h1 {
                    font-size: 28px;
                    font-weight: 600;
                    letter-spacing: -0.02em;
                    margin-bottom: 8px;
                }
                .hero p {
                    color: var(--text-muted);
                    font-size: 15px;
                }
                .card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .card-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
                label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                input, select {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid var(--border);
                    color: var(--text);
                    padding: 10px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    outline: none;
                    transition: border 0.2s;
                }
                input:focus, select:focus {
                    border-color: var(--primary);
                }
                button.btn-primary {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                button.btn-primary:hover { opacity: 0.9; }
                .events-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .event-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border);
                    padding: 14px 18px;
                    border-radius: 8px;
                }
                .event-title {
                    font-weight: 500;
                    font-size: 14px;
                }
                .event-sub {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-top: 2px;
                }
                .tag {
                    display: inline-block;
                    background: rgba(99,102,241,0.15);
                    color: #818CF8;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                }
                .empty-msg {
                    text-align: center;
                    color: var(--text-muted);
                    padding: 24px 0;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div class="brand">
                        <div class="logo">C</div>
                        <div>
                            <div style="font-weight:600; font-size:16px;">CueSpace</div>
                            <div style="font-size:12px; color:var(--text-muted);">Smart Event Engine</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <span class="status-pill"><span class="dot"></span> API Active</span>
                        <div class="nav-buttons">
                            <a href="/docs">Swagger Docs</a>
                            <a href="/redoc">ReDoc</a>
                            <a href="/health">Health</a>
                        </div>
                    </div>
                </header>

                <div class="hero">
                    <h1>Event & Notification Engine</h1>
                    <p>Timezone-aware recurring reminders with automated delivery.</p>
                </div>

                <!-- Add Event Form -->
                <div class="card">
                    <div class="card-title">Add New Smart Event</div>
                    <form id="eventForm">
                        <div class="form-grid">
                            <div>
                                <label>Event Title</label>
                                <input type="text" id="title" placeholder="e.g. Sarah's Birthday" required value="Sarah's Birthday" />
                            </div>
                            <div>
                                <label>Category</label>
                                <select id="category">
                                    <option value="birthday">Birthday</option>
                                    <option value="anniversary">Anniversary</option>
                                    <option value="deadline">Work Deadline</option>
                                    <option value="health">Health / Medical</option>
                                </select>
                            </div>
                            <div>
                                <label>Original Date</label>
                                <input type="date" id="original_date" required value="1998-06-25" />
                            </div>
                            <div>
                                <label>Reminder Time (Local)</label>
                                <input type="time" id="reminder_time" value="09:00" required />
                            </div>
                            <div>
                                <label>User Timezone</label>
                                <select id="timezone">
                                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                </select>
                            </div>
                            <div>
                                <label>Calendar System</label>
                                <select id="calendar_type">
                                    <option value="GREGORIAN">Gregorian (Standard)</option>
                                    <option value="HIJRI">Hijri (Lunar)</option>
                                    <option value="BENGALI">Bengali (Solar)</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end;">
                            <button type="submit" class="btn-primary" id="submitBtn">+ Schedule Event</button>
                        </div>
                    </form>
                </div>

                <!-- Event List -->
                <div class="card">
                    <div class="card-title">
                        <span>Scheduled Events in Database</span>
                        <button onclick="loadEvents()" style="background:transparent; border:none; color:var(--primary); font-size:13px; cursor:pointer;">Refresh List</button>
                    </div>
                    <div id="eventsContainer" class="events-list">
                        <div class="empty-msg">Loading events from database...</div>
                    </div>
                </div>
            </div>

            <script>
                async function loadEvents() {
                    const container = document.getElementById('eventsContainer');
                    try {
                        const res = await fetch('/api/v1/events/');
                        if (!res.ok) throw new Error('Failed to fetch');
                        const data = await res.json();
                        if (data.length === 0) {
                            container.innerHTML = '<div class="empty-msg">No events yet. Add your first event above!</div>';
                            return;
                        }
                        container.innerHTML = data.map(ev => `
                            <div class="event-item">
                                <div>
                                    <div class="event-title">${escapeHtml(ev.title)}</div>
                                    <div class="event-sub">📅 ${ev.original_date} &bull; ⏰ ${ev.reminder_time} &bull; 🌐 ${ev.timezone} (${ev.calendar_type})</div>
                                </div>
                                <div>
                                    <span class="tag">${ev.category.toUpperCase()}</span>
                                </div>
                            </div>
                        `).join('');
                    } catch (e) {
                        container.innerHTML = '<div class="empty-msg" style="color:#EF4444;">Error loading events. Is the backend server running?</div>';
                    }
                }

                document.getElementById('eventForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const btn = document.getElementById('submitBtn');
                    btn.disabled = true;
                    btn.innerText = 'Scheduling...';

                    const payload = {
                        title: document.getElementById('title').value,
                        category: document.getElementById('category').value,
                        original_date: document.getElementById('original_date').value,
                        reminder_time: document.getElementById('reminder_time').value + ':00',
                        timezone: document.getElementById('timezone').value,
                        calendar_type: document.getElementById('calendar_type').value,
                        channels: { email: true, sms: false, whatsapp: false },
                        alert_lead_days: [0, 3]
                    };

                    try {
                        const res = await fetch('/api/v1/events/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        if (!res.ok) {
                            const err = await res.json();
                            alert('Error: ' + JSON.stringify(err));
                        } else {
                            loadEvents();
                            alert('Event scheduled successfully with timezone awareness!');
                        }
                    } catch (err) {
                        alert('Request failed: ' + err.message);
                    } finally {
                        btn.disabled = false;
                        btn.innerText = '+ Schedule Event';
                    }
                });

                function escapeHtml(str) {
                    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                loadEvents();
            </script>
        </body>
        </html>
        """
    )
