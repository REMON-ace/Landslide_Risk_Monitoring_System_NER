"""
Chat / AI Assistant router — grounded on live database data.
Uses Google Gemini to answer questions only from real system data.
Also handles general conversation and location queries with actual coordinates.
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from app.db.session import get_db, engine
from app.models.models import Zone, Road, Alert, FieldReport, SeverityEnum, RoadStatusEnum
from app.core.config import settings

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    reply: str
    source: str  # "gemini" | "fallback"


# ---------------------------------------------------------------------------
# Coordinate extraction — handles both PostGIS (Supabase) and SQLite fallback
# ---------------------------------------------------------------------------

def _get_zone_coords(db: Session, zone: Zone):
    """Return (lat, lng) for a zone using PostGIS functions or WKT parsing."""
    try:
        if engine.dialect.name != "sqlite":
            from geoalchemy2.functions import ST_X, ST_Y
            row = db.query(
                ST_X(Zone.geometry).label("lng"),
                ST_Y(Zone.geometry).label("lat"),
            ).filter(Zone.id == zone.id).first()
            if row and row.lat is not None:
                return round(row.lat, 6), round(row.lng, 6)
        else:
            # SQLite stores geometry as WKT text like "POINT(lng lat)"
            geom_str = str(zone.geometry)
            if "POINT(" in geom_str:
                coords = geom_str.replace("POINT(", "").replace(")", "").strip().split()
                if len(coords) >= 2:
                    return round(float(coords[1]), 6), round(float(coords[0]), 6)
    except Exception:
        pass
    return None, None


# ---------------------------------------------------------------------------
# Context builder — pulls ALL relevant live data from the database
# ---------------------------------------------------------------------------

def _build_context(db: Session) -> str:
    """Pull live data from PostgreSQL (Supabase) and format as rich context."""

    # --- Zones with coordinates ---
    zones = db.query(Zone).order_by(Zone.current_risk_score.desc()).limit(30).all()
    zone_lines = []
    for z in zones:
        sev = z.current_severity.value if z.current_severity else "unknown"
        lat, lng = _get_zone_coords(db, z)
        coord_str = f"lat:{lat}, lng:{lng}" if lat is not None else "coordinates:unknown"
        district = z.district or "N/A"
        zone_lines.append(
            f"  - {z.village_name or z.zone_id} | ID:{z.zone_id} | district:{district} | "
            f"severity:{sev} | risk_score:{z.current_risk_score} | {coord_str}"
        )

    # --- Roads ---
    roads = db.query(Road).limit(30).all()
    road_lines = []
    for r in roads:
        status = r.status.value if r.status else "unknown"
        road_lines.append(
            f"  - {r.name} | ID:{r.road_id} | status:{status.upper()} | district:{r.district or 'N/A'}"
        )

    # --- Recent alerts ---
    alerts = (
        db.query(Alert, Zone.village_name)
        .join(Zone, Alert.zone_id == Zone.id, isouter=True)
        .order_by(Alert.sent_at.desc())
        .limit(20)
        .all()
    )
    alert_lines = []
    for a, village in alerts:
        sev = a.severity.value if a.severity else "unknown"
        location = f"{village or 'unknown village'}"
        lat_lng = f"lat:{a.lat}, lng:{a.lng}" if a.lat else ""
        alert_lines.append(
            f"  - [{sev.upper()}] {location} | zone_id:{a.zone_id} | "
            f"msg:{a.message[:100]} | sent:{a.sent_at} {lat_lng}"
        )

    # --- Field reports ---
    reports = (
        db.query(FieldReport)
        .filter(FieldReport.status != "archived")
        .order_by(FieldReport.submitted_at.desc())
        .limit(15)
        .all()
    )
    report_lines = []
    for rp in reports:
        report_lines.append(
            f"  - {rp.report_id}: {(rp.description or 'No description')[:80]} | "
            f"status:{rp.status.value if rp.status else 'unknown'} | "
            f"lat:{rp.lat}, lng:{rp.lng} | submitted:{rp.submitted_at}"
        )

    # --- Aggregate counts ---
    total_zones = db.query(Zone).count()
    high_risk = db.query(Zone).filter(
        Zone.current_severity.in_([SeverityEnum.high, SeverityEnum.critical])
    ).count()
    critical = db.query(Zone).filter(Zone.current_severity == SeverityEnum.critical).count()
    blocked_roads = db.query(Road).filter(Road.status == RoadStatusEnum.blocked).count()
    total_alerts = db.query(Alert).count()
    total_reports = db.query(FieldReport).filter(FieldReport.status != "archived").count()

    context = f"""
=== NER LANDSLIDE EARLY WARNING PLATFORM — LIVE DATABASE SNAPSHOT ===
Region: East Khasi Hills, Meghalaya, India | System: Supabase PostgreSQL

AGGREGATE STATISTICS:
  - Total Monitored Zones: {total_zones}
  - High + Critical Risk Zones: {high_risk} (Critical: {critical})
  - Blocked Road Corridors: {blocked_roads} of {len(roads)}
  - Total Alerts Issued: {total_alerts}
  - Active Field Reports: {total_reports}

RISK ZONES WITH GPS COORDINATES (sorted by risk score, top 30):
{chr(10).join(zone_lines) if zone_lines else "  No zone data in database yet. Run the seed script."}

ROAD NETWORK STATUS:
{chr(10).join(road_lines) if road_lines else "  No road data in database yet."}

RECENT EMERGENCY ALERTS (last 20):
{chr(10).join(alert_lines) if alert_lines else "  No alerts issued yet."}

RECENT FIELD REPORTS (last 15, excluding archived):
{chr(10).join(report_lines) if report_lines else "  No field reports submitted yet."}
""".strip()

    return context


# ---------------------------------------------------------------------------
# Gemini API call
# ---------------------------------------------------------------------------

def _call_gemini(context: str, history: list, user_message: str, api_key: str) -> str:
    import urllib.request
    import json

    system_prompt = (
        "You are the AI Risk Assistant for the NER Landslide Early Warning Platform, "
        "covering East Khasi Hills, Meghalaya, India. You assist disaster management officials "
        "and citizens with landslide monitoring information.\n\n"
        "RULES:\n"
        "1. For ANY question about risk zones, roads, alerts, field reports, locations, "
        "   coordinates, or statistics — use ONLY the live database data provided below. "
        "   Never invent zone names, coordinates, or numbers.\n"
        "2. For location/coordinate questions, always include the lat/lng from the data.\n"
        "3. For general conversation (greetings, how are you, what can you do, etc.), "
        "   respond naturally and helpfully as a disaster management AI assistant.\n"
        "4. If the requested data is not in the database snapshot, say: "
        "   'That information is not currently available in the monitoring system.'\n"
        "5. Be concise, professional, and factual. Use bullet points for lists.\n\n"
        f"{context}"
    )

    contents = []
    for turn in (history or [])[-8:]:
        role = turn.get("role", "user")
        t = turn.get("text", "")
        if role == "user":
            contents.append({"role": "user", "parts": [{"text": t}]})
        elif role == "assistant":
            contents.append({"role": "model", "parts": [{"text": t}]})

    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": 600,
            "temperature": 0.15,
            "topP": 0.9,
        },
    }

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    candidates = result.get("candidates", [])
    if not candidates:
        raise ValueError("No candidates in Gemini response")

    parts = candidates[0].get("content", {}).get("parts", [])
    return " ".join(p.get("text", "") for p in parts).strip()


# ---------------------------------------------------------------------------
# Rule-based fallback (no Gemini key or API error)
# ---------------------------------------------------------------------------

def _fallback_response(user_message: str, db: Session) -> str:
    q = user_message.lower().strip()

    zones = db.query(Zone).order_by(Zone.current_risk_score.desc()).all()
    roads = db.query(Road).all()
    alerts = (
        db.query(Alert, Zone.village_name)
        .join(Zone, Alert.zone_id == Zone.id, isouter=True)
        .order_by(Alert.sent_at.desc())
        .limit(5)
        .all()
    )
    reports = (
        db.query(FieldReport)
        .filter(FieldReport.status != "archived")
        .order_by(FieldReport.submitted_at.desc())
        .limit(5)
        .all()
    )

    high_zones = [z for z in zones if z.current_severity in [SeverityEnum.high, SeverityEnum.critical]]
    blocked = [r for r in roads if r.status == RoadStatusEnum.blocked]

    # --- General conversation ---
    greetings = ["hello", "hi", "hey", "good morning", "good evening", "good afternoon", "greetings"]
    if any(q.startswith(g) or q == g for g in greetings):
        return (
            "Hello! I'm the AI Risk Assistant for the NER Landslide Early Warning Platform. "
            "I can help you with:\n"
            "• High-risk zone locations and GPS coordinates\n"
            "• Blocked road corridors\n"
            "• Recent emergency alerts\n"
            "• Field incident reports\n"
            "• System overview and statistics\n\n"
            "What would you like to know?"
        )

    how_are_you = ["how are you", "how r u", "how do you do", "what's up", "whats up"]
    if any(g in q for g in how_are_you):
        high_count = len(high_zones)
        blocked_count = len(blocked)
        if high_count > 0 or blocked_count > 0:
            return (
                f"I'm operational and monitoring the situation. Currently there are "
                f"{high_count} high/critical risk zone(s) and {blocked_count} blocked road(s). "
                f"Please stay alert and follow official directives."
            )
        return (
            "All systems are operational. No high-risk zones or blocked roads detected at this time. "
            "How can I assist you?"
        )

    what_can = ["what can you", "what do you", "help", "capabilities", "features"]
    if any(g in q for g in what_can):
        return (
            "I can answer questions about:\n"
            "• 📍 Location & GPS coordinates of risk zones\n"
            "• ⚠️ High-risk and critical areas\n"
            "• 🚧 Blocked road corridors\n"
            "• 🔔 Recent emergency alerts\n"
            "• 📋 Field incident reports\n"
            "• 📊 System statistics and overview\n\n"
            "All answers come directly from the live monitoring database."
        )

    # --- Location / coordinates queries ---
    location_keywords = [
        "location", "where", "coordinate", "coordinates", "gps", "lat", "lng",
        "latitude", "longitude", "map", "position", "place", "address"
    ]
    if any(kw in q for kw in location_keywords):
        if not zones:
            return "No zone location data is available in the database yet."

        # Check if asking about a specific zone by name
        matched = []
        for z in zones:
            name = (z.village_name or "").lower()
            zone_id = (z.zone_id or "").lower()
            if name in q or zone_id in q:
                matched.append(z)

        if matched:
            lines = []
            for z in matched[:5]:
                lat, lng = _get_zone_coords(db, z)
                sev = z.current_severity.value if z.current_severity else "unknown"
                coord = f"GPS: {lat}°N, {lng}°E" if lat is not None else "GPS: unavailable"
                lines.append(
                    f"• {z.village_name or z.zone_id} (ID: {z.zone_id})\n"
                    f"  Severity: {sev.upper()} | Risk Score: {z.current_risk_score}\n"
                    f"  District: {z.district} | {coord}"
                )
            return "Location details for matched zone(s):\n\n" + "\n\n".join(lines)

        # General location query — show top risk zones with coordinates
        target_zones = high_zones[:8] if high_zones else zones[:8]
        label = "high/critical risk" if high_zones else "monitored"
        lines = []
        for z in target_zones:
            lat, lng = _get_zone_coords(db, z)
            sev = z.current_severity.value if z.current_severity else "unknown"
            coord = f"GPS: {lat}°N, {lng}°E" if lat is not None else "GPS: unavailable"
            lines.append(
                f"• {z.village_name or z.zone_id} ({z.zone_id})\n"
                f"  Severity: {sev.upper()} | Score: {z.current_risk_score} | {coord}"
            )

        return (
            f"Locations of {label} zones ({len(target_zones)} shown):\n\n"
            + "\n\n".join(lines)
            + "\n\nOpen the Risk Map to see these plotted on an interactive map."
        )

    # --- High risk zones ---
    if any(w in q for w in ["high-risk", "high risk", "critical", "danger", "risk zone", "risk area"]):
        if not high_zones:
            return f"All {len(zones)} monitored zones are currently at Low or Medium risk. No critical areas detected."
        lines = []
        for z in high_zones[:6]:
            lat, lng = _get_zone_coords(db, z)
            sev = z.current_severity.value if z.current_severity else "unknown"
            coord = f"GPS: {lat}°N, {lng}°E" if lat is not None else ""
            lines.append(f"• {z.village_name or z.zone_id} — {sev.upper()} (Score: {z.current_risk_score}) {coord}")
        return f"⚠️ {len(high_zones)} elevated-risk sector(s):\n\n" + "\n".join(lines)

    # --- Blocked roads ---
    if any(w in q for w in ["road", "blocked", "traffic", "corridor", "highway", "route", "nh"]):
        if not blocked:
            return f"All {len(roads)} monitored corridors are currently CLEAR with no obstructions."
        lines = [f"• {r.name} (ID: {r.road_id}) — BLOCKED | {r.district or 'N/A'}" for r in blocked]
        return f"⚠️ {len(blocked)} blocked corridor(s):\n\n" + "\n".join(lines)

    # --- Alerts ---
    if any(w in q for w in ["alert", "warning", "directive", "emergency", "evacuation"]):
        if not alerts:
            return "No active emergency warning directives at this time."
        lines = [
            f"• [{(a.severity.value if a.severity else 'unknown').upper()}] "
            f"{village or a.zone_id}: {a.message[:80]}"
            for a, village in alerts
        ]
        return f"Latest {len(alerts)} alert(s):\n\n" + "\n".join(lines)

    # --- Field reports ---
    if any(w in q for w in ["report", "field", "incident", "submit", "observation"]):
        if not reports:
            return "No field reports have been submitted yet."
        lines = [
            f"• {rp.report_id}: {(rp.description or 'No description')[:60]} "
            f"({rp.status.value if rp.status else 'unknown'}) | lat:{rp.lat}, lng:{rp.lng}"
            for rp in reports
        ]
        return f"Latest {len(reports)} field report(s):\n\n" + "\n".join(lines)

    # --- Summary / overview ---
    if any(w in q for w in ["summary", "overview", "situation", "total", "status", "statistics", "stat"]):
        crit = sum(1 for z in zones if z.current_severity == SeverityEnum.critical)
        high = sum(1 for z in zones if z.current_severity == SeverityEnum.high)
        return (
            f"System Overview — East Khasi Hills:\n"
            f"• {len(zones)} total monitored zones\n"
            f"  — {crit} Critical, {high} High risk\n"
            f"• {len(blocked)} blocked road corridor(s) of {len(roads)} total\n"
            f"• {len(alerts)} recent alert(s)\n"
            f"• {len(reports)} active field report(s)"
        )

    # --- Soil / weather (no DB data without sensors) ---
    if any(w in q for w in ["soil", "moisture", "sensor"]):
        return "Soil moisture sensor data is monitored across regional IoT nodes."

    if any(w in q for w in ["weather", "rain", "rainfall", "precipitation"]):
        return "Weather and rainfall telemetry is collected per zone from IMD stations."

    if any(w in q for w in ["predictor", "model", "ahp", "algorithm", "how does", "explain"]):
        return (
            "The landslide hazard model uses an Analytical Hierarchy Process (AHP) with 6 factors:\n"
            "1. Slope Gradient (30%)\n"
            "2. Antecedent Rainfall Index (25%)\n"
            "3. Soil Moisture & Lithology (15%)\n"
            "4. Slope Curvature (10%)\n"
            "5. Land Use / Land Cover (10%)\n"
            "6. Distance to Drainage & Roads (10%)\n\n"
            "Test it on the Risk Predictor page."
        )

    # --- Default ---
    return (
        "I can help with: zone locations & GPS coordinates, high-risk areas, "
        "blocked roads, recent alerts, or field reports. What would you like to know?"
    )


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    AI chat endpoint. Fetches live data from Supabase PostgreSQL and uses Gemini
    to answer questions in a grounded, factual manner.
    Also handles general conversation naturally.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    # Build live context from DB
    try:
        context = _build_context(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error building context: {e}")

    gemini_api_key = getattr(settings, "gemini_api_key", "").strip()

    if gemini_api_key:
        try:
            reply = _call_gemini(
                context=context,
                history=request.history or [],
                user_message=request.message.strip(),
                api_key=gemini_api_key,
            )
            return ChatResponse(reply=reply, source="gemini")
        except Exception as e:
            print(f"[chat] Gemini API error: {e}")
            # Fall through to rule-based fallback

    reply = _fallback_response(request.message, db)
    return ChatResponse(reply=reply, source="fallback")
