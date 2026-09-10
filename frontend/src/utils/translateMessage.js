/**
 * Translate dynamic alert messages and descriptions based on known patterns and translation keys.
 */
export function translateMessage(msg, t) {
  if (!msg || typeof msg !== 'string') return msg || '';
  const trimmed = msg.trim();

  // Critical evacuation message
  if (
    trimmed.includes('Imminent landslide risk. Evacuate immediately') ||
    trimmed.includes('CRITICAL: Imminent landslide risk') ||
    trimmed.includes('Imminent landslide risk detected')
  ) {
    return t(
      'alert_messages.critical_evacuate',
      'CRITICAL: Imminent landslide risk. Evacuate immediately. Follow official instructions.'
    );
  }

  // NH-206 alert
  if (
    trimmed.includes('avoid travel near NH-206') ||
    trimmed.includes('near NH-206')
  ) {
    return t(
      'alert_messages.high_nh206',
      'Heavy rainfall detected. Risk of slope failure — avoid travel near NH-206.'
    );
  }

  // This area alert
  if (
    trimmed.includes('avoid travel in this area') ||
    trimmed.includes('in this area')
  ) {
    return t(
      'alert_messages.high_this_area',
      'Heavy rainfall detected. Risk of slope failure — avoid travel in this area.'
    );
  }

  // Landslide prone areas alert
  if (
    trimmed.includes('avoid travel near landslide-prone areas') ||
    trimmed.includes('landslide-prone areas')
  ) {
    return t(
      'alert_messages.high_prone_areas',
      'Heavy rainfall detected. Risk of slope failure — avoid travel near landslide-prone areas.'
    );
  }

  // High risk heavy rainfall
  if (
    trimmed.includes('High risk of slope failure') ||
    trimmed.includes('Heavy rainfall detected')
  ) {
    return t(
      'alert_messages.heavy_rainfall_high_risk',
      'Heavy rainfall detected. High risk of slope failure.'
    );
  }

  // Road closure
  if (
    trimmed.includes('Road closure reported') ||
    trimmed.includes('closure reported in your district')
  ) {
    return t(
      'alert_messages.road_closure',
      'Road closure reported in your district due to landslide activity.'
    );
  }

  // Ground hazard report
  if (
    trimmed.includes('Ground hazard report submitted') ||
    trimmed.includes('Ground hazard report logged')
  ) {
    return t(
      'alert_messages.ground_hazard_report',
      'Ground hazard report submitted by field responder.'
    );
  }

  return msg;
}
