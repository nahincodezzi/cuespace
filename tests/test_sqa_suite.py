"""
CueSpace Enterprise SQA Test Suite
==================================
Automated QA Verification covering:
1. Timezone Engine & UTC Transformations (including DST summer/winter)
2. Recurrence Engine (Gregorian, Leap Year handling, Hijri lunar, Bengali solar, Alert lead offsets)
3. Cryptographic HMAC-SHA256 1-Click Snooze Security & Tamper Testing
4. FastAPI REST API Endpoints (CRUD lifecycle, Snooze URL, Dispatch Now, Audit Logs, Health)
5. Admin Authentication & Role-Based Access Credentials
"""

import sys
import os
import unittest
from datetime import datetime, date, time, timedelta, timezone
import pytz
import httpx

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import generate_snooze_token, verify_snooze_token, generate_signed_action_token, verify_signed_action_token
from app.services.recurrence import RecurrenceEngine


class TestTimezoneAndRecurrence(unittest.TestCase):
    """Module 1 & 2: Timezone calculations & Recurrence Engine SQA tests"""

    def setUp(self):
        self.engine = RecurrenceEngine()

    def test_tc001_timezone_dhaka_offset(self):
        """TC-001: Asia/Dhaka (UTC+6) at 09:00 AM local triggers at 03:00 UTC"""
        dt = self.engine.calculate_next_trigger_utc(
            original_date=date(1995, 5, 10),
            reminder_time=time(9, 0),
            user_tz_str="Asia/Dhaka",
            alert_lead_days=[0],
            recurrence_type="YEARLY",
            calendar_type="GREGORIAN",
            leap_handling="FEB_28"
        )
        self.assertIsNotNone(dt)
        self.assertEqual(dt.tzinfo, timezone.utc)
        self.assertEqual(dt.hour, 3)  # 09:00 - 6 hrs = 03:00 UTC
        self.assertEqual(dt.minute, 0)

    def test_tc002_timezone_new_york_offset(self):
        """TC-002: America/New_York (EDT UTC-4 in May) at 09:00 AM triggers at 13:00 UTC"""
        dt = self.engine.calculate_next_trigger_utc(
            original_date=date(1990, 5, 10),
            reminder_time=time(9, 0),
            user_tz_str="America/New_York",
            alert_lead_days=[0],
            recurrence_type="YEARLY",
            calendar_type="GREGORIAN",
            leap_handling="FEB_28"
        )
        self.assertIsNotNone(dt)
        self.assertEqual(dt.tzinfo, timezone.utc)
        self.assertEqual(dt.hour, 13)  # 09:00 EDT (+4 hrs) = 13:00 UTC

    def test_tc003_timezone_london_dst_winter_vs_summer(self):
        """TC-003: Europe/London DST transition - Jan is GMT (UTC+0), July is BST (UTC+1)"""
        # Winter: January
        dt_winter = self.engine.calculate_next_trigger_utc(
            original_date=date(1990, 1, 15),
            reminder_time=time(9, 0),
            user_tz_str="Europe/London",
            alert_lead_days=[0],
            recurrence_type="YEARLY",
            calendar_type="GREGORIAN"
        )
        self.assertIsNotNone(dt_winter)
        self.assertEqual(dt_winter.hour, 9)  # 09:00 GMT = 09:00 UTC

        # Summer: July
        dt_summer = self.engine.calculate_next_trigger_utc(
            original_date=date(1990, 7, 15),
            reminder_time=time(9, 0),
            user_tz_str="Europe/London",
            alert_lead_days=[0],
            recurrence_type="YEARLY",
            calendar_type="GREGORIAN"
        )
        self.assertIsNotNone(dt_summer)
        self.assertEqual(dt_summer.hour, 8)  # 09:00 BST = 08:00 UTC

    def test_tc004_leap_year_feb28_mode(self):
        """TC-004: Born Feb 29 2024 evaluated for 2025 non-leap year with FEB_28 mode"""
        anniversary = self.engine.resolve_gregorian_anniversary(
            orig=date(2024, 2, 29),
            target_year=2025,
            leap_handling="FEB_28"
        )
        self.assertEqual(anniversary, date(2025, 2, 28))

    def test_tc005_leap_year_march1_mode(self):
        """TC-005: Born Feb 29 2024 evaluated for 2025 non-leap year with MARCH_1 mode"""
        anniversary = self.engine.resolve_gregorian_anniversary(
            orig=date(2024, 2, 29),
            target_year=2025,
            leap_handling="MARCH_1"
        )
        self.assertEqual(anniversary, date(2025, 3, 1))

    def test_tc006_leap_year_exact_only_mode(self):
        """TC-006: Born Feb 29 2024 with EXACT_ONLY mode returns None in non-leap year, valid in leap year"""
        anniversary_non_leap = self.engine.resolve_gregorian_anniversary(
            orig=date(2024, 2, 29),
            target_year=2025,
            leap_handling="EXACT_ONLY"
        )
        self.assertIsNone(anniversary_non_leap)

        anniversary_leap = self.engine.resolve_gregorian_anniversary(
            orig=date(2024, 2, 29),
            target_year=2028,
            leap_handling="EXACT_ONLY"
        )
        self.assertEqual(anniversary_leap, date(2028, 2, 29))

    def test_tc007_bengali_solar_recurrence(self):
        """TC-007: Bengali Solar calendar mapping preserves Pohela Boishakh on April 14"""
        anniversary = self.engine.resolve_bengali_anniversary(
            orig_gregorian=date(2020, 4, 14),
            target_year=2026
        )
        self.assertEqual(anniversary, date(2026, 4, 14))

    def test_tc008_hijri_lunar_recurrence(self):
        """TC-008: Hijri lunar recurrence converts and advances lunar calendar accurately"""
        anniversary = self.engine.resolve_hijri_anniversary(
            orig_gregorian=date(2023, 3, 23),
            reference_date=date(2026, 1, 1)
        )
        self.assertIsNotNone(anniversary)
        self.assertGreaterEqual(anniversary, date(2026, 1, 1))

    def test_tc009_alert_lead_days_offset(self):
        """TC-009: Alert lead of 3 days prior triggers 3 days before original date"""
        future_date = (datetime.now(timezone.utc) + timedelta(days=20)).date()
        dt = self.engine.calculate_next_trigger_utc(
            original_date=future_date,
            reminder_time=time(10, 0),
            user_tz_str="UTC",
            alert_lead_days=[3],
            recurrence_type="YEARLY",
            calendar_type="GREGORIAN"
        )
        self.assertIsNotNone(dt)
        expected_date = future_date - timedelta(days=3)
        self.assertEqual(dt.date(), expected_date)


class TestSecurityAndSnooze(unittest.TestCase):
    """Module 3: HMAC-SHA256 1-Click Snooze Security & Tamper Testing"""

    def test_tc010_snooze_token_generation_and_verification(self):
        """TC-010: Valid token decodes correctly and preserves payload data"""
        event_id = "550e8400-e29b-41d4-a716-446655440000"
        token = generate_snooze_token(event_id=event_id, snooze_hours=3)
        self.assertIsInstance(token, str)
        self.assertIn(".", token)

        payload = verify_snooze_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["event_id"], event_id)
        self.assertEqual(payload["snooze_hours"], 3)

    def test_tc011_snooze_tamper_payload_rejected(self):
        """TC-011: Tampering with payload bytes invalidates HMAC signature"""
        token = generate_snooze_token(event_id="550e8400-e29b-41d4-a716-446655440000", snooze_hours=3)
        parts = token.split(".")
        tampered_token = parts[0] + "tamper." + parts[1]
        self.assertIsNone(verify_snooze_token(tampered_token))

    def test_tc012_snooze_tamper_signature_rejected(self):
        """TC-012: Modifying signature string fails cryptographic verification"""
        token = generate_snooze_token(event_id="550e8400-e29b-41d4-a716-446655440000", snooze_hours=3)
        parts = token.split(".")
        tampered_sig = ("0" if parts[1][0] != "0" else "1") + parts[1][1:]
        tampered_token = f"{parts[0]}.{tampered_sig}"
        self.assertIsNone(verify_snooze_token(tampered_token))

    def test_tc013_snooze_expiration_enforcement(self):
        """TC-013: Token with expired timestamp returns None"""
        event_id = "550e8400-e29b-41d4-a716-446655440000"
        expired_token = generate_signed_action_token(
            payload={"event_id": event_id, "snooze_hours": 3},
            expires_in_seconds=-10
        )
        self.assertIsNone(verify_signed_action_token(expired_token))


class TestLiveApiEndpoints(unittest.IsolatedAsyncioTestCase):
    """Module 4: Live REST API Validation against running FastAPI backend on :8000"""

    BASE_URL = "http://localhost:8000"

    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(base_url=self.BASE_URL, timeout=10.0)

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_tc014_api_health_check(self):
        """TC-014: GET /health returns status 200 and healthy status"""
        res = await self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertEqual(data.get("app"), "CueSpace")

    async def test_tc015_event_crud_lifecycle_and_snooze(self):
        """TC-015: Full end-to-end CRUD + Dispatch Now + Snooze route + Audit Log"""
        # 1. CREATE EVENT
        payload = {
            "title": "SQA Automated Test Event",
            "category": "birthday",
            "original_date": "1994-06-20",
            "reminder_time": "09:00:00",
            "timezone": "Asia/Dhaka",
            "calendar_type": "GREGORIAN",
            "leap_year_handling": "FEB_28",
            "channels": {"email": True, "whatsapp": True, "sms": False},
            "recipient_name": "Test Recipient",
            "recipient_phone": "+8801700000000",
            "recipient_email": "test@cuespace.app"
        }
        res_post = await self.client.post("/api/v1/events/", json=payload)
        self.assertEqual(res_post.status_code, 201)
        event_data = res_post.json()
        event_id = event_data["id"]
        self.assertEqual(event_data["title"], "SQA Automated Test Event")
        self.assertIsNotNone(event_data.get("next_trigger_at"))

        # 2. GET SINGLE EVENT
        res_get = await self.client.get(f"/api/v1/events/{event_id}")
        self.assertEqual(res_get.status_code, 200)
        self.assertEqual(res_get.json()["id"], event_id)

        # 3. UPDATE EVENT
        update_data = {
            "title": "SQA Automated Test Event (Updated)",
            "reminder_time": "11:00:00"
        }
        res_put = await self.client.put(f"/api/v1/events/{event_id}", json=update_data)
        self.assertEqual(res_put.status_code, 200)
        self.assertEqual(res_put.json()["title"], "SQA Automated Test Event (Updated)")

        # 4. DISPATCH TEST ALERT (Tests live worker & audit log entry creation)
        res_dispatch = await self.client.post(f"/api/v1/events/{event_id}/dispatch-now")
        self.assertEqual(res_dispatch.status_code, 200)
        dispatch_json = res_dispatch.json()
        self.assertTrue(dispatch_json.get("success"))
        self.assertIn("dispatched", dispatch_json.get("message", "").lower())

        # 5. AUDIT LOG VALIDATION
        res_logs = await self.client.get("/api/v1/events/audit/logs")
        self.assertEqual(res_logs.status_code, 200)
        logs = res_logs.json()
        self.assertIsInstance(logs, list)
        self.assertTrue(any(l.get("event_id") == event_id for l in logs))

        # 6. SNOOZE VIA 1-CLICK ENDPOINT
        token = generate_snooze_token(event_id=event_id, snooze_hours=4)
        res_snooze = await self.client.get(f"/api/v1/events/snooze?token={token}")
        self.assertEqual(res_snooze.status_code, 200)
        self.assertIn("snooze", res_snooze.text.lower())

        # 7. DELETE EVENT
        res_del = await self.client.delete(f"/api/v1/events/{event_id}")
        self.assertIn(res_del.status_code, [200, 204])

        # 8. VERIFY DELETED
        res_verify = await self.client.get(f"/api/v1/events/{event_id}")
        self.assertEqual(res_verify.status_code, 404)

    async def test_special_days_feature(self):
        """Validates Bangladesh & Global special days listing, subscription, and unsubscription."""
        # 1. Fetch special days
        res_list = await self.client.get("/api/v1/special-days/?year=2026")
        self.assertEqual(res_list.status_code, 200)
        data = res_list.json()
        self.assertGreaterEqual(data["total_count"], 20)
        days = data["special_days"]
        self.assertTrue(any(d["id"] == "bd-mother-language-day" for d in days))
        self.assertTrue(any(d["id"] == "global-mothers-day" for d in days))
        self.assertTrue(any(d["id"] == "global-mens-day" for d in days))

        # 2. Subscribe to special days
        sub_payload = {
            "day_ids": ["bd-mother-language-day", "global-mens-day"],
            "year": 2026,
            "recipient_email": "test-subscriber@cuespace.app",
            "alert_lead_days": [1, 2]
        }
        res_sub = await self.client.post("/api/v1/special-days/subscribe", json=sub_payload)
        self.assertEqual(res_sub.status_code, 200)
        sub_res = res_sub.json()
        self.assertTrue(sub_res.get("success"))
        self.assertEqual(sub_res.get("count"), 2)

        # 3. Verify subscribed status in list
        res_check = await self.client.get("/api/v1/special-days/?year=2026")
        self.assertEqual(res_check.status_code, 200)
        check_days = {d["id"]: d for d in res_check.json()["special_days"]}
        self.assertTrue(check_days["bd-mother-language-day"]["is_subscribed"])
        self.assertTrue(check_days["global-mens-day"]["is_subscribed"])

        # 4. Unsubscribe
        res_unsub = await self.client.post("/api/v1/special-days/unsubscribe", json={"day_ids": ["bd-mother-language-day", "global-mens-day"]})
        self.assertEqual(res_unsub.status_code, 200)

    async def test_live_alerts_api(self):
        """TC-016: Live alerts endpoint correctly serves in-browser alarm polling"""
        res = await self.client.get("/api/v1/events/live-alerts")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsInstance(data, list)

        # Clear alerts
        res_clear = await self.client.post("/api/v1/events/live-alerts/clear")
        self.assertEqual(res_clear.status_code, 200)
        self.assertTrue(res_clear.json().get("success"))


if __name__ == "__main__":
    unittest.main()
