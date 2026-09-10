import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Route,
  Bell,
} from 'lucide-react';
import KpiCard from './admin/KpiCard';

export default function SummaryCards({
  summary,
  zones = [],
  isLoading,
  onCardClick,
}) {
  const { t } = useTranslation();

  // Compute actual high and critical counts from zones if available, or fallback to summary
  const criticalCount =
    summary?.critical_risk_zones ??
    zones.filter((z) => z.severity?.toLowerCase() === 'critical').length;

  const highCount =
    summary?.high_risk_zones ??
    zones.filter((z) => z.severity?.toLowerCase() === 'high').length;

  const blockedCount =
    summary?.roads_blocked ?? 0;

  const totalZones =
    summary?.total_zones_monitored ?? (zones.length > 0 ? zones.length : 10);

  const activeAlerts =
    summary?.active_alerts ?? 0;

  const cards = [
    {
      id: 'total_zones',
      title: t('summary.monitored_zones', { defaultValue: 'Total Risk Zones' }),
      value: totalZones,
      icon: Activity,
      variant: 'primary',
      statusText: t('summary.status_monitoring_active', { defaultValue: 'Monitoring active' }),
    },
    {
      id: 'high_risk',
      title: t('summary.high_risk_areas', { defaultValue: 'High Risk Areas' }),
      value: highCount,
      icon: AlertTriangle,
      variant: 'high',
      statusText: highCount > 0 ? t('summary.status_elevated_attention', { defaultValue: 'Elevated attention' }) : t('summary.status_nominal', { defaultValue: 'Nominal status' }),
    },
    {
      id: 'critical_risk',
      title: t('summary.critical_risk', { defaultValue: 'Critical Risk' }),
      value: criticalCount,
      icon: ShieldAlert,
      variant: 'critical',
      statusText: criticalCount > 0 ? t('summary.status_urgent_response', { defaultValue: 'Urgent response' }) : t('summary.status_no_critical', { defaultValue: 'No critical alerts' }),
    },
    {
      id: 'roads_blocked',
      title: t('summary.blocked_roads', { defaultValue: 'Blocked Roads' }),
      value: blockedCount,
      icon: Route,
      variant: 'warning',
      statusText: blockedCount > 0 ? t('summary.status_corridors_impacted', { defaultValue: 'Corridors impacted' }) : t('summary.status_all_clear', { defaultValue: 'All clear' }),
    },
    {
      id: 'active_alerts',
      title: t('summary.active_alerts', { defaultValue: 'Active Alerts' }),
      value: activeAlerts,
      icon: Bell,
      variant: 'rose',
      statusText: activeAlerts > 0 ? t('summary.status_public_directives', { defaultValue: 'Public directives' }) : t('summary.status_clear_standby', { defaultValue: 'Clear standby' }),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card) => (
        <KpiCard
          key={card.id}
          title={card.title}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
          isLoading={isLoading}
          statusText={card.statusText}
          onClick={() => onCardClick?.(card.id, card.title, card.value)}
        />
      ))}
    </div>
  );
}
