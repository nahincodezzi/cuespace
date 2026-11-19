from datetime import date, datetime, time, timedelta, timezone
from typing import List, Dict, Any, Optional
import calendar

def get_nth_weekday_of_month(year: int, month: int, weekday: int, n: int) -> date:
    """
    Finds the n-th occurrence of a weekday in a given month and year.
    weekday: 0 = Monday, 6 = Sunday.
    n: 1 for 1st, 2 for 2nd, etc.
    """
    first_day = date(year, month, 1)
    day_diff = (weekday - first_day.weekday()) % 7
    first_occurrence = first_day + timedelta(days=day_diff)
    return first_occurrence + timedelta(weeks=n - 1)


# Comprehensive master catalog of Bangladesh & Worldwide Special Days
RAW_SPECIAL_DAYS: List[Dict[str, Any]] = [
    # =========================================================================
    # 1. BANGLADESH NATIONAL & CULTURAL SPECIAL DAYS
    # =========================================================================
    {
        "id": "bd-mother-language-day",
        "title": "International Mother Language Day",
        "title_bn": "শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 2,
        "day": 21,
        "icon": "🌸",
        "description": "Honoring the 1952 language movement martyrs. Global celebration of linguistic and cultural diversity.",
        "tags": ["Bangladesh", "National", "UNESCO"],
        "default_lead_days": [1, 2],
        "wish_template": "২১শে ফেব্রুয়ারি শহীদ দিবসে সকল ভাষা শহীদদের প্রতি গভীর শ্রদ্ধা ও অমর একুশের শুভেচ্ছা।"
    },
    {
        "id": "bd-children-day",
        "title": "National Children's Day (BD)",
        "title_bn": "জাতীয় শিশু দিবস ও বঙ্গবন্ধুর জন্মদিন",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 3,
        "day": 17,
        "icon": "👶",
        "description": "Celebrating the bright future, rights, and creative potential of children across the nation.",
        "tags": ["Bangladesh", "National", "Children"],
        "default_lead_days": [1, 2],
        "wish_template": "জাতীয় শিশু দিবসে সকল শিশুদের সুন্দর ও আনন্দময় ভবিষ্যতের শুভকামনা।"
    },
    {
        "id": "bd-independence-day",
        "title": "Independence Day of Bangladesh",
        "title_bn": "মহান স্বাধীনতা ও জাতীয় দিবস",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 3,
        "day": 26,
        "icon": "🇧🇩",
        "description": "Commemorating the declaration of independence of Bangladesh in 1971. A glorious national holiday.",
        "tags": ["Bangladesh", "National", "Holiday"],
        "default_lead_days": [1, 2],
        "wish_template": "মহান স্বাধীনতা দিবসের রক্তিম শুভেচ্ছা! দেশের প্রতি রইলো আন্তরিক ভালোবাসা।"
    },
    {
        "id": "bd-pohela-boishakh",
        "title": "Pohela Boishakh (Bengali New Year)",
        "title_bn": "পহেলা বৈশাখ (শুভ নববর্ষ)",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 4,
        "day": 14,
        "icon": "🎭",
        "description": "The first day of the Bengali solar calendar. Celebrated with colorful Mangal Shobhajatra and festivities.",
        "tags": ["Bangladesh", "Cultural", "Festival"],
        "default_lead_days": [1, 2],
        "wish_template": "শুভ নববর্ষ! নতুন বছরের প্রতিটি দিন ভরে উঠুক অনাবিল আনন্দ ও সফলতায়।"
    },
    {
        "id": "bd-may-day",
        "title": "May Day (Workers' Day)",
        "title_bn": "মহান মে দিবস (আন্তর্জাতিক শ্রমিক দিবস)",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 5,
        "day": 1,
        "icon": "🛠️",
        "description": "Honoring workers' rights and historical labor movements across Bangladesh and the world.",
        "tags": ["Bangladesh", "International", "Labor"],
        "default_lead_days": [1, 2],
        "wish_template": "মহান মে দিবসে শ্রমজীবী মানুষের অধিকার ও ত্যাগের প্রতি বিনম্র শ্রদ্ধা।"
    },
    {
        "id": "bd-national-mourning-day",
        "title": "National Mourning Day",
        "title_bn": "জাতীয় শোক দিবস",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 8,
        "day": 15,
        "icon": "🖤",
        "description": "Solemn commemoration and tribute to the founding leadership of the nation.",
        "tags": ["Bangladesh", "National", "Mourning"],
        "default_lead_days": [1, 2],
        "wish_template": "জাতীয় শোক দিবসে গভীর শ্রদ্ধাঞ্জলি।"
    },
    {
        "id": "bd-armed-forces-day",
        "title": "Armed Forces Day (BD)",
        "title_bn": "সশস্ত্র বাহিনী দিবস",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 11,
        "day": 21,
        "icon": "🎖️",
        "description": "Recognizing the bravery, dedication, and joint liberation warfare of the army, navy, and air forces.",
        "tags": ["Bangladesh", "National", "Defense"],
        "default_lead_days": [1, 2],
        "wish_template": "সশস্ত্র বাহিনী দিবসে দেশের সার্বভৌমত্ব রক্ষায় নিয়োজিত বীর সৈনিকদের আন্তরিক অভিনন্দন।"
    },
    {
        "id": "bd-martyred-intellectuals-day",
        "title": "Martyred Intellectuals Day",
        "title_bn": "শহীদ বুদ্ধিজীবী দিবস",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 12,
        "day": 14,
        "icon": "🕯️",
        "description": "Solemn tribute to the professors, doctors, writers, and thinkers martyred in 1971.",
        "tags": ["Bangladesh", "Memorial"],
        "default_lead_days": [1, 2],
        "wish_template": "শহীদ বুদ্ধিজীবী দিবসে জাতির শ্রেষ্ঠ সন্তানদের প্রতি গভীর শ্রদ্ধা ও বিনম্র সালাম।"
    },
    {
        "id": "bd-victory-day",
        "title": "Victory Day of Bangladesh",
        "title_bn": "মহান বিজয় দিবস",
        "category": "bangladesh",
        "rule": "fixed",
        "month": 12,
        "day": 16,
        "icon": "🏆",
        "description": "Commemorating the surrender of occupying forces and the triumphant victory of Bangladesh in 1971.",
        "tags": ["Bangladesh", "National", "Victory"],
        "default_lead_days": [1, 2],
        "wish_template": "মহান বিজয় দিবসের রক্তিম শুভেচ্ছা! বিজয়ের উল্লাসে মুখরিত হোক প্রিয় মাতৃভূমি।"
    },

    # =========================================================================
    # 2. WORLDWIDE & FAMILY OBSERVANCES (Men's Day, Women's Day, Mother's Day, etc.)
    # =========================================================================
    {
        "id": "global-new-year",
        "title": "Global New Year's Day",
        "title_bn": "আন্তর্জাতিক ইংরেজি নববর্ষ",
        "category": "international",
        "rule": "fixed",
        "month": 1,
        "day": 1,
        "icon": "🎆",
        "description": "Welcoming the arrival of the new calendar year with optimism, resolutions, and joy.",
        "tags": ["Worldwide", "Celebration", "Holiday"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy New Year! May this year bring incredible joy, health, and prosperity."
    },
    {
        "id": "global-valentines-day",
        "title": "Valentine's Day",
        "title_bn": "বিশ্ব ভালোবাসা দিবস",
        "category": "family",
        "rule": "fixed",
        "month": 2,
        "day": 14,
        "icon": "❤️",
        "description": "A day celebrating love, affection, friendship, and cherished relationships worldwide.",
        "tags": ["Worldwide", "Love", "Family"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy Valentine's Day! Wishing you warmth, appreciation, and endless love."
    },
    {
        "id": "global-womens-day",
        "title": "International Women's Day",
        "title_bn": "আন্তর্জাতিক নারী দিবস",
        "category": "family",
        "rule": "fixed",
        "month": 3,
        "day": 8,
        "icon": "👩",
        "description": "Celebrating the social, economic, cultural, and political achievements of women worldwide.",
        "tags": ["Worldwide", "Women", "Appreciation"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy International Women's Day! Celebrating the strength, grace, and impact of women everywhere."
    },
    {
        "id": "global-earth-day",
        "title": "World Earth Day",
        "title_bn": "বিশ্ব ধরিত্রী দিবস",
        "category": "international",
        "rule": "fixed",
        "month": 4,
        "day": 22,
        "icon": "🌍",
        "description": "Raising environmental awareness and advocating for climate action and ecosystem preservation.",
        "tags": ["Worldwide", "Environment", "Nature"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy World Earth Day! Let us protect our planet for generations to come."
    },
    {
        "id": "global-mothers-day",
        "title": "International Mother's Day",
        "title_bn": "বিশ্ব মা দিবস",
        "category": "family",
        "rule": "floating_mothers_day",  # 2nd Sunday of May
        "month": 5,
        "day": 10,  # dynamically computed per year
        "icon": "💐",
        "description": "Honoring mothers, maternal bonds, and the immense love and sacrifices of mothers globally.",
        "tags": ["Worldwide", "Family", "Mother"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy Mother's Day! Thank you for your unconditional love, guidance, and endless care."
    },
    {
        "id": "global-environment-day",
        "title": "World Environment Day",
        "title_bn": "বিশ্ব পরিবেশ দিবস",
        "category": "international",
        "rule": "fixed",
        "month": 6,
        "day": 5,
        "icon": "🌿",
        "description": "UN flagship day encouraging global awareness and action for the protection of our environment.",
        "tags": ["Worldwide", "UN", "Environment"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy World Environment Day! Plant a tree and preserve our green earth."
    },
    {
        "id": "global-fathers-day",
        "title": "International Father's Day",
        "title_bn": "বিশ্ব বাবা দিবস",
        "category": "family",
        "rule": "floating_fathers_day",  # 3rd Sunday of June
        "month": 6,
        "day": 21,  # dynamically computed per year
        "icon": "👔",
        "description": "Celebrating fatherhood, paternal bonds, and the enduring guidance of fathers in our lives.",
        "tags": ["Worldwide", "Family", "Father"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy Father's Day! Thank you for your unwavering support, strength, and wisdom."
    },
    {
        "id": "global-friendship-day",
        "title": "International Friendship Day",
        "title_bn": "আন্তর্জাতিক বন্ধুত্ব দিবস",
        "category": "family",
        "rule": "floating_friendship_day",  # 1st Sunday of August
        "month": 8,
        "day": 2,  # dynamically computed per year
        "icon": "🤝",
        "description": "Fostering bonds of fellowship, shared memories, and lifelong loyalty between friends.",
        "tags": ["Worldwide", "Friends", "Celebration"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy Friendship Day! Grateful to have you as a true friend through thick and thin."
    },
    {
        "id": "global-peace-day",
        "title": "International Day of Peace",
        "title_bn": "আন্তর্জাতিক শান্তি দিবস",
        "category": "international",
        "rule": "fixed",
        "month": 9,
        "day": 21,
        "icon": "🕊️",
        "description": "Promoting world peace, non-violence, and cessation of hostilities globally.",
        "tags": ["Worldwide", "Peace", "UN"],
        "default_lead_days": [1, 2],
        "wish_template": "On International Day of Peace, let us foster harmony, understanding, and kindness."
    },
    {
        "id": "global-teachers-day",
        "title": "World Teachers' Day",
        "title_bn": "বিশ্ব শিক্ষক দিবস",
        "category": "family",
        "rule": "fixed",
        "month": 10,
        "day": 5,
        "icon": "🎓",
        "description": "Appreciating educators who shape generations, empower minds, and illuminate the future.",
        "tags": ["Worldwide", "Education", "Appreciation"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy World Teachers' Day! Heartfelt gratitude to the mentors who enlightened our path."
    },
    {
        "id": "global-mental-health-day",
        "title": "World Mental Health Day",
        "title_bn": "বিশ্ব মানসিক স্বাস্থ্য দিবস",
        "category": "international",
        "rule": "fixed",
        "month": 10,
        "day": 10,
        "icon": "🧠",
        "description": "Raising awareness about mental wellbeing, reducing stigma, and advocating for care support.",
        "tags": ["Worldwide", "Health", "Wellbeing"],
        "default_lead_days": [1, 2],
        "wish_template": "World Mental Health Day: Remember that it's okay not to be okay, and taking care of your mind matters."
    },
    {
        "id": "global-mens-day",
        "title": "International Men's Day",
        "title_bn": "আন্তর্জাতিক পুরুষ দিবস",
        "category": "family",
        "rule": "fixed",
        "month": 11,
        "day": 19,
        "icon": "👨",
        "description": "Promoting positive male role models, men's health, wellbeing, and constructive contributions to society.",
        "tags": ["Worldwide", "Men", "Appreciation"],
        "default_lead_days": [1, 2],
        "wish_template": "Happy International Men's Day! Honoring the positive impact, kindness, and strength of men."
    },
    {
        "id": "global-human-rights-day",
        "title": "Human Rights Day",
        "title_bn": "আন্তর্জাতিক মানবাধিকার দিবস",
        "category": "international",
        "rule": "fixed",
        "month": 12,
        "day": 10,
        "icon": "⚖️",
        "description": "Commemorating the adoption of the Universal Declaration of Human Rights by the United Nations.",
        "tags": ["Worldwide", "Human Rights", "UN"],
        "default_lead_days": [1, 2],
        "wish_template": "On Human Rights Day, reaffirming dignity, freedom, and equal justice for every human being."
    },
    {
        "id": "global-christmas-day",
        "title": "Christmas Day",
        "title_bn": "শুভ বড়দিন (ক্রিসমাস)",
        "category": "international",
        "rule": "fixed",
        "month": 12,
        "day": 25,
        "icon": "🎄",
        "description": "Worldwide festive holiday celebrating peace, joy, togetherness, and gift-giving.",
        "tags": ["Worldwide", "Celebration", "Holiday"],
        "default_lead_days": [1, 2],
        "wish_template": "Merry Christmas! Wishing you and your loved ones warmth, peace, and holiday joy."
    }
]


def resolve_special_day_date(day_def: Dict[str, Any], year: int) -> date:
    """Calculates the exact calendar date for a special day in a given year."""
    rule = day_def.get("rule", "fixed")
    
    if rule == "floating_mothers_day":
        # 2nd Sunday of May (weekday 6)
        return get_nth_weekday_of_month(year, 5, 6, 2)
    elif rule == "floating_fathers_day":
        # 3rd Sunday of June (weekday 6)
        return get_nth_weekday_of_month(year, 6, 6, 3)
    elif rule == "floating_friendship_day":
        # 1st Sunday of August (weekday 6)
        return get_nth_weekday_of_month(year, 8, 6, 1)
    else:
        # Fixed Gregorian month and day
        month = day_def["month"]
        day = day_def["day"]
        # Clamp if February in non-leap year
        max_d = calendar.monthrange(year, month)[1]
        return date(year, month, min(day, max_d))


def get_all_special_days(year: int = 2026, reference_date: Optional[date] = None) -> List[Dict[str, Any]]:
    """
    Returns the enriched list of all special days for the given year,
    including exact computed date, countdown in days, and sorting.
    """
    ref_d = reference_date or date.today()
    results = []

    for item in RAW_SPECIAL_DAYS:
        exact_date = resolve_special_day_date(item, year)
        days_until = (exact_date - ref_d).days

        results.append({
            **item,
            "year": year,
            "date": exact_date.isoformat(),
            "month_name": exact_date.strftime("%B"),
            "formatted_date": exact_date.strftime("%b %d, %Y"),
            "days_until": days_until,
            "status": "passed" if days_until < 0 else "today" if days_until == 0 else "upcoming"
        })

    # Sort chronologically by date
    results.sort(key=lambda x: x["date"])
    return results
