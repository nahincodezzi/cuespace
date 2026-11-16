import calendar
from datetime import date, datetime, time, timedelta, timezone
from typing import Optional, List
import pytz
from hijri_converter import Gregorian, Hijri


class RecurrenceEngine:
    """
    Computes exact, timezone-aware next trigger times for events across
    Gregorian, Hijri, and Regional (Bengali) solar/lunar calendars, with
    custom leap year logic (Feb 28 vs March 1) and alert lead offsets.
    """

    @staticmethod
    def is_leap_year(year: int) -> bool:
        return calendar.isleap(year)

    @classmethod
    def resolve_gregorian_anniversary(
        cls,
        orig: date,
        target_year: int,
        leap_handling: str = "FEB_28"
    ) -> Optional[date]:
        """Calculates anniversary date in target_year, gracefully handling Feb 29 leap years."""
        if orig.month == 2 and orig.day == 29:
            if cls.is_leap_year(target_year):
                return date(target_year, 2, 29)
            if leap_handling == "EXACT_ONLY":
                return None
            elif leap_handling == "MARCH_1":
                return date(target_year, 3, 1)
            else:  # FEB_28 default
                return date(target_year, 2, 28)

        # Standard month/day clamping for months with fewer days
        max_day = calendar.monthrange(target_year, orig.month)[1]
        clamped_day = min(orig.day, max_day)
        return date(target_year, orig.month, clamped_day)

    @classmethod
    def resolve_hijri_anniversary(cls, orig_gregorian: date, reference_date: date) -> date:
        """
        Converts the Gregorian anchor into Hijri lunar date, then finds the next
        occurrence of that Hijri month/day on or after reference_date.
        """
        try:
            orig_hijri = Gregorian(orig_gregorian.year, orig_gregorian.month, orig_gregorian.day).to_hijri()
            ref_hijri = Gregorian(reference_date.year, reference_date.month, reference_date.day).to_hijri()
            
            # Start from current Hijri year
            target_h_year = ref_hijri.year
            candidate_h = Hijri(target_h_year, orig_hijri.month, min(orig_hijri.day, 29))
            candidate_g = candidate_h.to_gregorian()
            candidate_date = date(candidate_g.year, candidate_g.month, candidate_g.day)
            
            if candidate_date < reference_date:
                # Advance to next Hijri year
                candidate_h = Hijri(target_h_year + 1, orig_hijri.month, min(orig_hijri.day, 29))
                candidate_g = candidate_h.to_gregorian()
                candidate_date = date(candidate_g.year, candidate_g.month, candidate_g.day)
                
            return candidate_date
        except Exception:
            # Fallback to Gregorian anniversary if conversion fails
            return cls.resolve_gregorian_anniversary(orig_gregorian, reference_date.year)

    @classmethod
    def resolve_bengali_anniversary(cls, orig_gregorian: date, target_year: int) -> date:
        """
        Bengali Solar Calendar aligns with the astronomical sidereal/tropical transit.
        In Bangladesh revised calendar, the first 6 months have 31 days (Boishakh-Ashwin),
        next 5 have 30 days (Kartik-Magh), and Falgun has 29/30 days.
        Gregorian mapping is consistent: Boishakh 1 = April 14.
        """
        return cls.resolve_gregorian_anniversary(orig_gregorian, target_year)

    @classmethod
    def compute_next_event_date(
        cls,
        original_date: date,
        reference_date: date,
        recurrence_type: str,
        recurrence_interval: int,
        calendar_type: str,
        leap_handling: str
    ) -> Optional[date]:
        """Finds the next event occurrence date on or after reference_date."""
        if recurrence_type == "NONE":
            return original_date if original_date >= reference_date else None

        if calendar_type == "HIJRI":
            return cls.resolve_hijri_anniversary(original_date, reference_date)

        if recurrence_type == "YEARLY":
            target_year = reference_date.year
            for year in range(target_year, target_year + 10):
                candidate = cls.resolve_gregorian_anniversary(original_date, year, leap_handling)
                if candidate and candidate >= reference_date:
                    return candidate
            return None

        if recurrence_type == "MONTHLY":
            curr_year = reference_date.year
            curr_month = reference_date.month
            for _ in range(36):
                max_days = calendar.monthrange(curr_year, curr_month)[1]
                target_day = min(original_date.day, max_days)
                candidate = date(curr_year, curr_month, target_day)
                if candidate >= reference_date:
                    return candidate
                curr_month += recurrence_interval
                while curr_month > 12:
                    curr_month -= 12
                    curr_year += 1
            return None

        if recurrence_type == "WEEKLY":
            delta_days = (original_date.weekday() - reference_date.weekday()) % 7
            candidate = reference_date + timedelta(days=delta_days)
            return candidate

        return original_date

    @classmethod
    def calculate_next_trigger_utc(
        cls,
        original_date: date,
        reminder_time: time,
        user_tz_str: str,
        alert_lead_days: List[int],
        recurrence_type: str = "YEARLY",
        recurrence_interval: int = 1,
        calendar_type: str = "GREGORIAN",
        leap_handling: str = "FEB_28",
        snooze_until: Optional[datetime] = None
    ) -> Optional[datetime]:
        """
        Calculates the earliest next UTC trigger timestamp taking into account:
        - Active snooze override
        - Alert lead offsets (e.g. 3 days prior, 1 day prior, on day)
        - User's localized timezone wall-clock time
        """
        now_utc = datetime.now(timezone.utc)

        # 1. Snooze priority check
        if snooze_until and snooze_until > now_utc:
            return snooze_until

        try:
            tz = pytz.timezone(user_tz_str)
        except Exception:
            tz = pytz.UTC

        now_in_tz = now_utc.astimezone(tz)
        today_in_tz = now_in_tz.date()

        sorted_leads = sorted(alert_lead_days, reverse=True)  # e.g. [3, 1, 0]

        # Check candidate occurrences for this cycle and next cycle
        for cycle_offset_year in range(3):
            search_ref_date = date(today_in_tz.year + cycle_offset_year, 1, 1) if cycle_offset_year > 0 else today_in_tz
            event_occurrence = cls.compute_next_event_date(
                original_date=original_date,
                reference_date=search_ref_date,
                recurrence_type=recurrence_type,
                recurrence_interval=recurrence_interval,
                calendar_type=calendar_type,
                leap_handling=leap_handling
            )

            if not event_occurrence:
                continue

            for lead in sorted_leads:
                alert_date = event_occurrence - timedelta(days=lead)
                naive_dt = datetime.combine(alert_date, reminder_time)
                try:
                    localized_dt = tz.localize(naive_dt, is_dst=None)
                except (pytz.AmbiguousTimeError, pytz.NonExistentTimeError):
                    localized_dt = tz.localize(naive_dt, is_dst=False)

                trigger_utc = localized_dt.astimezone(timezone.utc)
                if trigger_utc > now_utc:
                    return trigger_utc

        return None
