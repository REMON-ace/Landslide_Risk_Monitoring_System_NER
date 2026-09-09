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
      title: 'Total Risk Zones',
      value: totalZones,
      icon: Activity,
      variant: 'primary',
      statusText: 'Monitoring active',
    },
    {
      id: 'high_risk',
      title: 'High Risk Areas',
      value: highCount,
      icon: AlertTriangle,
      variant: 'high',
      statusText: highCount > 0 ? 'Elevated attention' : 'Nominal status',
    },
    {
      id: 'critical_risk',
      title: 'Critical Risk',
      value: criticalCount,
      icon: ShieldAlert,
      variant: 'critical',
      statusText: criticalCount > 0 ? 'Urgent response' : 'No critical alerts',
    },
    {
      id: 'roads_blocked',
      title: 'Blocked Roads',
      value: blockedCount,
      icon: Route,
      variant: 'warning',
      statusText: blockedCount > 0 ? 'Corridors impacted' : 'All clear',
    },
    {
      id: 'active_alerts',
      title: 'Active Alerts',
      value: activeAlerts,
      icon: Bell,
      variant: 'rose',
      statusText: activeAlerts > 0 ? 'Public directives' : 'Clear standby',
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
