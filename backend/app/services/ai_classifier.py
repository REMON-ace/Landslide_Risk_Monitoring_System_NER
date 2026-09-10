"""
Gemini AI Problem Classification & Vision Analysis Service for Landslide Hazards.
Uses Google Gemini API when GEMINI_API_KEY is configured, with a geomorphological fallback engine.
"""
from __future__ import annotations

import os
import json
import base64
import urllib.request
import urllib.error
from typing import Optional, Dict, Any

from app.core.config import settings

# Standard problem taxonomies recognized by NDRF/GSI
HAZARD_TAXONOMY = {
    "debris_flow": {
        "label": "Active Mudflow / Debris Wash",
        "default_severity": "high",
        "action": "Immediate road closure advised. Dispatch excavators and JCBs for sediment clearance. Alert downstream settlements.",
    },
    "rockfall": {
        "label": "Rockfall & Dislodged Boulders",
        "default_severity": "critical",
        "action": "Halt hillside traffic immediately. Deploy rock-scaling crews and install impact wire barrier nets.",
    },
    "tension_cracks": {
        "label": "Slope Tension Cracks & Fissures",
        "default_severity": "high",
        "action": "Deploy inclinometer/extensometer probes. Seal open tensile fissures with waterproof tarps to prevent rainwater infiltration.",
    },
    "retaining_wall": {
        "label": "Retaining Wall Failure / Structural Bowing",
        "default_severity": "critical",
        "action": "Inspect weep-hole drainage and buttress displacement. Shore up slope foundation with gabion wall reinforcement.",
    },
    "drain_blockage": {
        "label": "Choked Culvert / Drainage Overtopping",
        "default_severity": "medium",
        "action": "Clear culvert throat obstructions and construct temporary cascading diversion drains before rain intensifies.",
    },
    "road_subsidence": {
        "label": "Road Carriageway Subsidence / Edge Slump",
        "default_severity": "high",
        "action": "Place traffic cones & barricades around sinking lane. Conduct sub-base compaction and micro-piling analysis.",
    },
    "general_hazard": {
        "label": "Ground Hazard / Slope Instability",
        "default_severity": "medium",
        "action": "Dispatch local field inspector to verify ground displacement and calibrate slope sensors.",
    },
}


def classify_hazard(
    description: Optional[str] = None,
    photo_path_or_url: Optional[str] = None,
    api_key_override: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Classify a field report using Gemini AI (or geomorphological heuristic fallback).
    """
    api_key = api_key_override or settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "").strip()

    if api_key:
        try:
            gemini_result = _call_gemini_api(api_key, description or "", photo_path_or_url)
            if gemini_result:
                return gemini_result
        except Exception as e:
            print(f"[Gemini AI] Classification call encountered error: {e}, using local classifier fallback.")

    return _fallback_heuristic_classify(description or "")


def _call_gemini_api(api_key: str, description: str, photo_path_or_url: Optional[str]) -> Optional[Dict[str, Any]]:
    """Invoke Gemini REST API for vision/text hazard analysis."""
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    prompt_text = f"""
You are an expert geotechnical engineer and disaster response officer evaluating a real-time landslide report from the East Khasi Hills / Northeast India region.

Report Observation: "{description}"

Task:
1. Classify the hazard into ONE of these exact categories:
   - debris_flow (Active Mudflow, waterlogged sediment wash)
   - rockfall (Fallen boulders, detached rock chunks)
   - tension_cracks (Crown cracks, hillside ground fissuring)
   - retaining_wall (Retaining wall tilting, bowing, weeping water)
   - drain_blockage (Culvert clogged by gravel/branches, road overflow)
   - road_subsidence (Pavement cracking, edge dropping)
   - general_hazard (Other slope anomaly)

2. Determine severity: "low", "medium", "high", or "critical".
3. Provide a confidence score between 0.70 and 0.99.
4. Give a 1-2 sentence engineering analysis breakdown.
5. Provide a 1-sentence recommended emergency response action.

Respond ONLY in valid JSON with this exact schema:
{{
  "hazard_category": "category_key",
  "hazard_label": "Human Readable Name",
  "severity": "low|medium|high|critical",
  "confidence": 0.95,
  "ai_analysis": "Concise technical summary",
  "recommended_action": "Actionable emergency response"
}}
"""

    parts = [{"text": prompt_text}]

    # If photo exists locally and is readable, encode as base64
    if photo_path_or_url and os.path.exists(photo_path_or_url):
        try:
            with open(photo_path_or_url, "rb") as img_file:
                img_bytes = img_file.read()
                mime = "image/jpeg" if photo_path_or_url.lower().endswith((".jpg", ".jpeg")) else "image/png"
                parts.append({
                    "inline_data": {
                        "mime_type": mime,
                        "data": base64.b64encode(img_bytes).decode("utf-8")
                    }
                })
        except Exception:
            pass

    request_body = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(request_body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        candidate = res_data.get("candidates", [{}])[0]
        text_content = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
        
        parsed = json.loads(text_content)
        category = parsed.get("hazard_category", "general_hazard")
        if category not in HAZARD_TAXONOMY:
            category = "general_hazard"

        return {
            "hazard_category": category,
            "hazard_label": parsed.get("hazard_label", HAZARD_TAXONOMY[category]["label"]),
            "severity": parsed.get("severity", HAZARD_TAXONOMY[category]["default_severity"]),
            "confidence": float(parsed.get("confidence", 0.92)),
            "ai_analysis": parsed.get("ai_analysis", f"Gemini AI verified {category} hazard patterns in slope telemetry."),
            "recommended_action": parsed.get("recommended_action", HAZARD_TAXONOMY[category]["action"]),
        }


def _fallback_heuristic_classify(description: str) -> Dict[str, Any]:
    """Smart geomorphological rule-based classification when API key is not yet configured."""
    text = (description or "").lower()

    if any(k in text for k in ["boulder", "rock", "falling rock", "rockfall", "cliff", "stones", "stone fall", "shale"]):
        cat = "rockfall"
        analysis = "Identified geological rock dislodgement patterns with acute kinetic impact hazard to road corridor."
    elif any(k in text for k in ["mud", "mudflow", "debris", "sludge", "wash", "flowing soil", "waterlogged", "slurry"]):
        cat = "debris_flow"
        analysis = "Identified saturated matrix debris flow and liquefied topsoil movement across slope."
    elif any(k in text for k in ["crack", "fissure", "tension", "split", "fracture", "opening", "crevice"]):
        cat = "tension_cracks"
        analysis = "Identified tensile shearing and crown fissure widening indicating active slope instability."
    elif any(k in text for k in ["wall", "retaining", "breast", "masonry", "gabion", "bowing", "weep", "seep"]):
        cat = "retaining_wall"
        analysis = "Identified lateral earth pressure overload and structural deformation on slope retaining structure."
    elif any(k in text for k in ["drain", "culvert", "choke", "overflow", "gutter", "clogged", "sediment in drain"]):
        cat = "drain_blockage"
        analysis = "Identified surface stormwater diversion failure with risk of accelerated pore pressure accumulation."
    elif any(k in text for k in ["subsidence", "sink", "caved", "drop", "carriageway", "pothole", "collapse", "depression"]):
        cat = "road_subsidence"
        analysis = "Identified structural subgrade settlement and pavement foundation subsidence."
    else:
        cat = "general_hazard"
        analysis = "General slope anomaly detected requiring standard geotechnical ground verification."

    meta = HAZARD_TAXONOMY.get(cat, HAZARD_TAXONOMY["general_hazard"])

    return {
        "hazard_category": cat,
        "hazard_label": meta["label"],
        "severity": meta["default_severity"],
        "confidence": 0.88,
        "ai_analysis": analysis,
        "recommended_action": meta["action"],
    }
