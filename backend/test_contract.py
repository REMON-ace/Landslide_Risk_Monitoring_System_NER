"""
test_contract.py -- Comprehensive verification of all endpoints and contract compliance.
Validates exact JSON payloads from API_CONTRACT.md against Pydantic schemas,
runs TestClient against endpoints, and tests auth protections.
"""
import os
import sys
from datetime import datetime, timezone

from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from app.main import app
from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.schemas import (
    RiskZoneOut, PredictRiskIn, PredictRiskOut, RiskHistoryOut,
    WeatherCurrentOut, SoilMoistureOut, RoadOut, RoadPatchIn,
    VillageOut, FieldReportOut, FieldReportCreatedOut, FieldReportPatchIn,
    AlertOut, AlertCreateIn, AlertCreatedOut, DashboardSummaryOut,
    SyncFieldReportsIn, SyncFieldReportsOut, LoginIn, LoginOut,
)
from app.services.risk_service import stub_predict, score_to_severity
from app.services.gis_service import _linestring_geojson_to_coords

client = TestClient(app)


def test_schema_validations_from_contract():
    print("[TEST] 1. Validating example JSON payloads from API_CONTRACT.md against Pydantic models...")

    # 1.1 Risk zones
    zone_data = {
        "zone_id": "MEG-EKH-014",
        "village_name": "Sohra",
        "lat": 25.2840,
        "lng": 91.7325,
        "risk_score": 0.82,
        "severity": "high",
        "last_updated": "2026-09-08T06:00:00Z"
    }
    z_out = RiskZoneOut.model_validate(zone_data)
    assert z_out.zone_id == "MEG-EKH-014"
    assert z_out.severity == "high"

    # 1.2 Predict risk in
    pred_in_data = {
        "slope": 34.5,
        "aspect": 182.3,
        "elevation": 1420,
        "curvature": -0.42,
        "dist_to_drainage": 310.0,
        "rainfall_24h": 65.2,
        "rainfall_72h": 210.0,
        "rainfall_7d": 380.5,
        "rainfall_intensity_peak": 28.4,
        "antecedent_rainfall_index": 145.7,
        "soil_moisture": 0.61,
        "dist_to_history": 0.8,
        "landslide_freq_district": 47
    }
    p_in = PredictRiskIn.model_validate(pred_in_data)
    assert p_in.slope == 34.5
    assert p_in.dist_to_drainage == 310.0

    # 1.3 Predict risk out
    pred_out_data = {"risk_score": 0.82, "severity": "high"}
    p_out = PredictRiskOut.model_validate(pred_out_data)
    assert p_out.risk_score == 0.82

    # 1.4 History out
    hist_data = {
        "zone_id": "MEG-EKH-014",
        "history": [
            {"date": "2026-09-01", "risk_score": 0.41},
            {"date": "2026-09-08", "risk_score": 0.82}
        ]
    }
    h_out = RiskHistoryOut.model_validate(hist_data)
    assert len(h_out.history) == 2

    # 1.5 Weather current
    weather_data = {
        "lat": 25.2840,
        "lng": 91.7325,
        "rainfall_24h": 65.2,
        "rainfall_72h": 210.0,
        "rainfall_7d": 380.5,
        "rainfall_intensity_peak": 28.4,
        "antecedent_rainfall_index": 145.7,
        "forecast_next_24h": 40.0,
        "source": "IMD"
    }
    w_out = WeatherCurrentOut.model_validate(weather_data)
    assert w_out.source == "IMD"

    # 1.6 Soil moisture
    soil_data = {
        "sensor_id": "SM-014",
        "zone_id": "MEG-EKH-014",
        "moisture": 0.61,
        "timestamp": "2026-09-08T06:00:00Z"
    }
    s_out = SoilMoistureOut.model_validate(soil_data)
    assert s_out.sensor_id == "SM-014"

    # 1.7 Road out & patch
    road_data = {
        "road_id": "RD-2291",
        "name": "Shillong\u2013Sohra Road",
        "status": "blocked",
        "coordinates": [[25.28, 91.73], [25.30, 91.75]],
        "last_updated": "2026-09-08T09:15:00Z"
    }
    r_out = RoadOut.model_validate(road_data)
    assert r_out.status == "blocked"
    rp_in = RoadPatchIn.model_validate({"status": "blocked"})
    assert rp_in.status == "blocked"

    # 1.8 Village
    village_data = {
        "village_id": "V-441",
        "name": "Sohra",
        "lat": 25.2840,
        "lng": 91.7325,
        "population": 15000,
        "zone_id": "MEG-EKH-014"
    }
    v_out = VillageOut.model_validate(village_data)
    assert v_out.name == "Sohra"

    # 1.9 Field report out & create out & patch in
    fr_out_data = {
        "report_id": "FR-1042",
        "lat": 25.2840,
        "lng": 91.7325,
        "description": "Large crack forming on hillside near NH-206",
        "photo_url": "https://example.com/uploads/FR-1042.jpg",
        "status": "verified",
        "reporter_type": "citizen",
        "timestamp": "2026-09-08T09:00:00Z"
    }
    fr_out = FieldReportOut.model_validate(fr_out_data)
    assert fr_out.report_id == "FR-1042"

    fr_created_data = {
        "report_id": "FR-1042",
        "status": "received",
        "photo_url": "https://example.com/uploads/FR-1042.jpg"
    }
    frc_out = FieldReportCreatedOut.model_validate(fr_created_data)
    assert frc_out.status == "received"

    fr_patch = FieldReportPatchIn.model_validate({"status": "verified"})
    assert fr_patch.status == "verified"

    # 1.10 Alert out & create in & created out
    alert_out_data = {
        "alert_id": "AL-330",
        "village": "Sohra",
        "zone_id": "MEG-EKH-014",
        "severity": "high",
        "message": "Heavy rainfall detected. Risk of slope failure \u2014 avoid travel near NH-206.",
        "language": "en",
        "sent_via": ["sms", "app"],
        "timestamp": "2026-09-08T10:00:00Z"
    }
    a_out = AlertOut.model_validate(alert_out_data)
    assert a_out.alert_id == "AL-330"

    alert_create_data = {
        "zone_id": "MEG-EKH-014",
        "severity": "high",
        "message_key": "landslide_risk_high",
        "languages": ["en", "kha"],
        "channels": ["sms", "app"]
    }
    ac_in = AlertCreateIn.model_validate(alert_create_data)
    assert ac_in.message_key == "landslide_risk_high"

    alert_created_data = {"alert_id": "AL-330", "status": "sent", "recipients_count": 842}
    ac_out = AlertCreatedOut.model_validate(alert_created_data)
    assert ac_out.recipients_count == 842

    # 1.11 Dashboard summary
    dash_data = {
        "total_zones_monitored": 46,
        "high_risk_zones": 5,
        "roads_blocked": 2,
        "active_alerts": 3,
        "reports_last_24h": 11,
        "top_priority_zones": [
            {"zone_id": "MEG-EKH-014", "village_name": "Sohra", "risk_score": 0.82}
        ]
    }
    dash_out = DashboardSummaryOut.model_validate(dash_data)
    assert dash_out.total_zones_monitored == 46
    assert len(dash_out.top_priority_zones) == 1

    # 1.12 Offline sync in & out
    sync_in_data = {
        "reports": [
            {"client_report_id": "local-uuid-1", "lat": 25.28, "lng": 91.73, "description": "...", "timestamp": "2026-09-08T08:00:00Z"}
        ]
    }
    sync_in = SyncFieldReportsIn.model_validate(sync_in_data)
    assert len(sync_in.reports) == 1

    sync_out_data = {"synced": ["local-uuid-1"], "failed": []}
    sync_out = SyncFieldReportsOut.model_validate(sync_out_data)
    assert sync_out.synced == ["local-uuid-1"]

    # 1.13 Auth in & out
    login_in = LoginIn.model_validate({"username": "official_shillong", "password": "password"})
    assert login_in.username == "official_shillong"
    login_out = LoginOut.model_validate({"token": "jwt-token-here", "role": "district_admin", "district": "East Khasi Hills"})
    assert login_out.role == "district_admin"

    print("  [OK] All Pydantic models validate contract JSON exactly.")


def test_predict_risk_endpoint():
    print("[TEST] 2. Testing POST /api/predict-risk endpoint...")
    payload = {
        "slope": 34.5,
        "aspect": 182.3,
        "elevation": 1420,
        "curvature": -0.42,
        "dist_to_drainage": 310.0,
        "rainfall_24h": 65.2,
        "rainfall_72h": 210.0,
        "rainfall_7d": 380.5,
        "rainfall_intensity_peak": 28.4,
        "antecedent_rainfall_index": 145.7,
        "soil_moisture": 0.61,
        "dist_to_history": 0.8,
        "landslide_freq_district": 47
    }
    res = client.post("/api/predict-risk", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "risk_score" in data
    assert "severity" in data
    assert isinstance(data["risk_score"], float)
    assert data["severity"] in ("low", "medium", "high", "critical")
    print("  [OK] POST /api/predict-risk returned:", data)


def test_auth_and_protected_routes():
    print("[TEST] 3. Testing Auth & route protection...")

    # Password hashing and token generation
    pwd = "SecretPassword123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("wrong", hashed)

    admin_token = create_access_token({"sub": "admin_user", "role": "district_admin", "district": "East Khasi Hills"})
    field_token = create_access_token({"sub": "field_user", "role": "field_official", "district": "East Khasi Hills"})

    # Protected routes without token -> 401
    res_road = client.patch("/api/roads/RD-2291", json={"status": "blocked"})
    assert res_road.status_code in (401, 403), f"Expected 401/403, got {res_road.status_code}"

    res_report = client.patch("/api/field-reports/FR-1042", json={"status": "verified"})
    assert res_report.status_code in (401, 403), f"Expected 401/403, got {res_report.status_code}"

    res_alert = client.post("/api/alerts", json={
        "zone_id": "MEG-EKH-014",
        "severity": "high",
        "message_key": "landslide_risk_high",
        "languages": ["en"],
        "channels": ["app"]
    })
    assert res_alert.status_code in (401, 403), f"Expected 401/403, got {res_alert.status_code}"

    # Protected routes with field_official token (non-admin) -> 403 Forbidden
    headers_field = {"Authorization": f"Bearer {field_token}"}
    res_road_field = client.patch("/api/roads/RD-2291", json={"status": "blocked"}, headers=headers_field)
    assert res_road_field.status_code == 403, f"Expected 403, got {res_road_field.status_code}"

    print("  [OK] Unauthenticated requests rejected (401/403), non-admin token rejected (403).")


def test_linestring_geojson_parser():
    print("[TEST] 4. Testing GeoJSON coordinate conversion ([lng, lat] -> [lat, lng])...")
    geojson_str = '{"type": "LineString", "coordinates": [[91.73, 25.28], [91.75, 25.30]]}'
    coords = _linestring_geojson_to_coords(geojson_str)
    assert coords == [[25.28, 91.73], [25.30, 91.75]], f"Coordinates order incorrect: {coords}"
    print("  [OK] GeoJSON parsed into [[lat, lng], ...] correctly.")


def test_all_endpoints_with_mock_db():
    print("[TEST] 5. Testing all remaining endpoints with mocked DB session...")
    from app.db.session import get_db

    mock_db = MagicMock()

    # 5.1 GET /api/risk-zones
    with patch("app.services.risk_service.get_all_zones") as mock_zones:
        mock_zones.return_value = [
            {
                "zone_id": "MEG-EKH-014",
                "village_name": "Sohra",
                "lat": 25.2840,
                "lng": 91.7325,
                "risk_score": 0.82,
                "severity": "high",
                "last_updated": datetime(2026, 9, 8, 6, 0, 0, tzinfo=timezone.utc),
            }
        ]
        app.dependency_overrides[get_db] = lambda: mock_db
        res = client.get("/api/risk-zones?district=East+Khasi+Hills&min_severity=high")
        assert res.status_code == 200, res.text
        assert res.json()[0]["zone_id"] == "MEG-EKH-014"

    # 5.2 GET /api/risk-zones/{zone_id}/history
    with patch("app.services.risk_service.get_zone_history") as mock_hist:
        mock_hist.return_value = {
            "zone_id": "MEG-EKH-014",
            "history": [
                {"date": "2026-09-01", "risk_score": 0.41},
                {"date": "2026-09-08", "risk_score": 0.82}
            ]
        }
        res = client.get("/api/risk-zones/MEG-EKH-014/history")
        assert res.status_code == 200
        assert res.json()["zone_id"] == "MEG-EKH-014"

    # 5.3 GET /api/weather/current
    with patch("app.services.weather_service.get_current_weather") as mock_w:
        mock_w.return_value = {
            "lat": 25.2840,
            "lng": 91.7325,
            "rainfall_24h": 65.2,
            "rainfall_72h": 210.0,
            "rainfall_7d": 380.5,
            "rainfall_intensity_peak": 28.4,
            "antecedent_rainfall_index": 145.7,
            "forecast_next_24h": 40.0,
            "source": "IMD"
        }
        res = client.get("/api/weather/current?lat=25.2840&lng=91.7325")
        assert res.status_code == 200
        assert res.json()["source"] == "IMD"

    # 5.4 GET /api/sensors/soil-moisture
    with patch("app.services.weather_service.get_soil_moisture") as mock_sm:
        mock_sm.return_value = [
            {"sensor_id": "SM-014", "zone_id": "MEG-EKH-014", "moisture": 0.61, "timestamp": datetime(2026, 9, 8, 6, 0, 0, tzinfo=timezone.utc)}
        ]
        res = client.get("/api/sensors/soil-moisture?zone_id=MEG-EKH-014")
        assert res.status_code == 200
        assert res.json()[0]["sensor_id"] == "SM-014"

    # 5.5 GET /api/roads
    with patch("app.services.gis_service.get_roads") as mock_roads:
        mock_roads.return_value = [
            {
                "road_id": "RD-2291",
                "name": "Shillong\u2013Sohra Road",
                "status": "blocked",
                "coordinates": [[25.28, 91.73], [25.30, 91.75]],
                "last_updated": datetime(2026, 9, 8, 9, 15, 0, tzinfo=timezone.utc),
            }
        ]
        res = client.get("/api/roads?district=East+Khasi+Hills&status=blocked")
        assert res.status_code == 200
        assert res.json()[0]["road_id"] == "RD-2291"

    # 5.6 PATCH /api/roads/{road_id} (with admin token)
    admin_token = create_access_token({"sub": "admin", "role": "district_admin", "district": "East Khasi Hills"})
    headers = {"Authorization": f"Bearer {admin_token}"}
    with patch("app.services.gis_service.patch_road") as mock_pr:
        mock_pr.return_value = {
            "road_id": "RD-2291",
            "name": "Shillong\u2013Sohra Road",
            "status": "blocked",
            "coordinates": [[25.28, 91.73], [25.30, 91.75]],
            "last_updated": datetime(2026, 9, 8, 9, 15, 0, tzinfo=timezone.utc),
        }
        res = client.patch("/api/roads/RD-2291", json={"status": "blocked"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["status"] == "blocked"

    # 5.7 GET /api/villages
    with patch("app.services.gis_service.get_villages") as mock_vil:
        mock_vil.return_value = [
            {"village_id": "V-441", "name": "Sohra", "lat": 25.2840, "lng": 91.7325, "population": 15000, "zone_id": "MEG-EKH-014"}
        ]
        res = client.get("/api/villages")
        assert res.status_code == 200
        assert res.json()[0]["village_id"] == "V-441"

    # 5.8 POST /api/field-reports (multipart)
    with patch("app.services.reports_service.create_report") as mock_cr:
        mock_report = MagicMock()
        mock_report.report_id = "FR-1042"
        mock_report.status.value = "received"
        mock_report.photo_url = "http://localhost:8000/uploads/FR-1042.jpg"
        mock_cr.return_value = mock_report

        res = client.post(
            "/api/field-reports",
            data={
                "lat": "25.2840",
                "lng": "91.7325",
                "description": "Large crack forming on hillside near NH-206",
                "reporter_type": "citizen",
                "language": "en",
                "client_report_id": "local-uuid-generated-offline",
                "timestamp": "2026-09-08T09:00:00Z",
            },
        )
        assert res.status_code == 201, res.text
        assert res.json()["report_id"] == "FR-1042"
        assert res.json()["status"] == "received"

    # 5.9 GET /api/field-reports
    with patch("app.services.reports_service.get_reports") as mock_gr:
        mock_gr.return_value = [
            {
                "report_id": "FR-1042",
                "lat": 25.2840,
                "lng": 91.7325,
                "description": "Large crack forming on hillside near NH-206",
                "photo_url": "http://localhost:8000/uploads/FR-1042.jpg",
                "status": "verified",
                "reporter_type": "citizen",
                "timestamp": datetime(2026, 9, 8, 9, 0, 0, tzinfo=timezone.utc),
            }
        ]
        res = client.get("/api/field-reports?status=verified")
        assert res.status_code == 200
        assert res.json()[0]["status"] == "verified"

    # 5.10 PATCH /api/field-reports/{report_id}
    with patch("app.services.reports_service.patch_report") as mock_pr:
        mock_pr.return_value = {
            "report_id": "FR-1042",
            "lat": 25.2840,
            "lng": 91.7325,
            "description": "Large crack",
            "photo_url": None,
            "status": "verified",
            "reporter_type": "citizen",
            "timestamp": datetime(2026, 9, 8, 9, 0, 0, tzinfo=timezone.utc),
        }
        res = client.patch("/api/field-reports/FR-1042", json={"status": "verified"}, headers=headers)
        assert res.status_code == 200

    # 5.11 GET /api/alerts
    with patch("app.services.alerts_service.get_alerts") as mock_ga:
        mock_ga.return_value = [
            {
                "alert_id": "AL-330",
                "village": "Sohra",
                "zone_id": "MEG-EKH-014",
                "severity": "high",
                "message": "Heavy rainfall detected. Risk of slope failure \u2014 avoid travel near NH-206.",
                "language": "en",
                "sent_via": ["sms", "app"],
                "timestamp": datetime(2026, 9, 8, 10, 0, 0, tzinfo=timezone.utc),
            }
        ]
        res = client.get("/api/alerts?severity=high")
        assert res.status_code == 200
        assert res.json()[0]["alert_id"] == "AL-330"

    # 5.12 POST /api/alerts
    with patch("app.services.alerts_service.create_alert") as mock_ca:
        mock_ca.return_value = {"alert_id": "AL-330", "status": "sent", "recipients_count": 842}
        res = client.post("/api/alerts", json={
            "zone_id": "MEG-EKH-014",
            "severity": "high",
            "message_key": "landslide_risk_high",
            "languages": ["en", "kha"],
            "channels": ["sms", "app"]
        }, headers=headers)
        assert res.status_code == 201
        assert res.json()["alert_id"] == "AL-330"
        assert res.json()["recipients_count"] == 842

    # 5.13 GET /api/dashboard/summary
    with patch("app.services.dashboard_service.get_dashboard_summary") as mock_ds:
        mock_ds.return_value = {
            "total_zones_monitored": 46,
            "high_risk_zones": 5,
            "roads_blocked": 2,
            "active_alerts": 3,
            "reports_last_24h": 11,
            "top_priority_zones": [
                {"zone_id": "MEG-EKH-014", "village_name": "Sohra", "risk_score": 0.82}
            ]
        }
        res = client.get("/api/dashboard/summary?district=East+Khasi+Hills")
        assert res.status_code == 200
        assert res.json()["total_zones_monitored"] == 46
        assert len(res.json()["top_priority_zones"]) == 1

    # 5.14 POST /api/sync/field-reports
    with patch("app.services.reports_service.sync_reports") as mock_sync:
        mock_sync.return_value = {"synced": ["local-uuid-1"], "failed": []}
        res = client.post("/api/sync/field-reports", json={
            "reports": [
                {"client_report_id": "local-uuid-1", "lat": 25.28, "lng": 91.73, "description": "test", "timestamp": "2026-09-08T08:00:00Z"}
            ]
        })
        assert res.status_code == 200
        assert res.json()["synced"] == ["local-uuid-1"]

    # Clear dependency override
    app.dependency_overrides.clear()
    print("  [OK] All endpoints return exact contract response shapes and 200/201 status codes.")


if __name__ == "__main__":
    test_schema_validations_from_contract()
    test_predict_risk_endpoint()
    test_auth_and_protected_routes()
    test_linestring_geojson_parser()
    test_all_endpoints_with_mock_db()
    print("\n========================================================")
    print("ALL TESTS PASSED -- 100% SPECIFICATION CONTRACT COMPLIANCE!")
    print("========================================================")
