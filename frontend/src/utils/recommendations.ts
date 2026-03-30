import { AdminDashboard, SessionStatus, VehicleSession } from '../types';

type RecommendationTone = 'info' | 'warning' | 'success';

export interface RecommendationItem {
  title: string;
  body: string;
  tone: RecommendationTone;
}

const formatAppointmentWindow = (appointmentAt?: string) => {
  if (!appointmentAt) return null;
  return new Date(appointmentAt).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export function getSessionRecommendation(session: VehicleSession): RecommendationItem {
  const arrivalWindow = formatAppointmentWindow(session.appointmentAt);

  if (session.status === 'EXPIRED') {
    return {
      title: 'Expired booking',
      body: 'No action is needed on the lane side. Reach out only if the customer asks to rebook.',
      tone: 'warning',
    };
  }

  if (session.status === 'REGISTERED') {
    if (!session.laneName) {
      return {
        title: 'Assign a lane first',
        body: `This booking is checked in but still waiting for a lane allocation${arrivalWindow ? ` after the ${arrivalWindow} appointment window` : ''}.`,
        tone: 'warning',
      };
    }

    return {
      title: 'Start wash from the assigned lane',
      body: `The customer is registered and ready. Move ${session.registrationNumber} into ${session.laneName} and begin the wash cycle.`,
      tone: 'info',
    };
  }

  if (session.status === 'WASHING') {
    return {
      title: 'Capture the wash progress',
      body: 'The exterior wash is in progress. Record mats and condition notes as soon as the wash phase is done.',
      tone: 'info',
    };
  }

  if (session.status === 'INTERIOR') {
    return {
      title: 'Prepare inspection handoff',
      body: 'Interior work is underway. The next clean handoff is inspection, so confirm finishing touches before calling the inspector.',
      tone: 'info',
    };
  }

  if (session.status === 'INSPECTION') {
    return {
      title: 'Close quality checks',
      body: 'Inspection is the last operations step. Confirm the vehicle meets branch standards, then complete the session for payment.',
      tone: 'warning',
    };
  }

  if (session.status === 'COMPLETED' && !session.paid) {
    return {
      title: 'Collect payment before release',
      body: 'The wash is complete, but the session is still unpaid. Record payment now so the customer can be closed out cleanly.',
      tone: 'warning',
    };
  }

  return {
    title: 'Ready for customer handoff',
    body: 'Operations and payment are complete. This session can be treated as ready for pickup and archive review.',
    tone: 'success',
  };
}

export function getBookingRecommendations(params: {
  branchLabel?: string;
  servicePackage?: string;
  vehicleType?: string;
  appointmentAt?: string;
  recommendedAddOnNames: string[];
  selectedAddOnServices: string[];
}): RecommendationItem[] {
  const items: RecommendationItem[] = [];
  const appointmentWindow = formatAppointmentWindow(params.appointmentAt);
  const unselectedRecommendedAddOns = params.recommendedAddOnNames.filter(
    (name) => !params.selectedAddOnServices.includes(name),
  );

  if (params.branchLabel) {
    items.push({
      title: `Branch match: ${params.branchLabel}`,
      body: 'This branch will receive the booking instantly on the staff session board as soon as you confirm.',
      tone: 'info',
    });
  }

  if (params.servicePackage && params.vehicleType) {
    items.push({
      title: `${params.vehicleType} package check`,
      body: `${params.servicePackage} is currently priced for the selected vehicle category, so the staff team will receive the correct session value and service mix.`,
      tone: 'success',
    });
  }

  if (unselectedRecommendedAddOns.length > 0) {
    items.push({
      title: 'Recommended extras available',
      body: `The strongest match for this booking is ${unselectedRecommendedAddOns.slice(0, 2).join(' and ')}. Adding them now avoids manual upsell later.`,
      tone: 'warning',
    });
  } else if (params.selectedAddOnServices.length > 0) {
    items.push({
      title: 'Add-on bundle looks complete',
      body: 'Your selected extras already cover the main recommended add-ons for this booking.',
      tone: 'success',
    });
  }

  if (appointmentWindow) {
    items.push({
      title: 'Arrival slot locked in',
      body: `This booking is set for ${appointmentWindow}. If the customer does not show, the session expires 24 hours after that scheduled time.`,
      tone: 'info',
    });
  }

  return items.slice(0, 3);
}

export function getAdminRecommendations(params: {
  dashboard: AdminDashboard;
  selectedBranchName?: string;
  branchMetrics?: {
    todayRevenue: number;
    activeSessions: number;
    statusBreakdown: Record<string, number>;
    servicesBreakdown: Record<string, number>;
  } | null;
}): RecommendationItem[] {
  const { dashboard, branchMetrics, selectedBranchName } = params;
  const items: RecommendationItem[] = [];

  const weakestBranch = [...dashboard.branchStats].sort((a, b) => a.completionRate - b.completionRate)[0];
  if (weakestBranch && weakestBranch.completionRate < 70) {
    items.push({
      title: `Support ${weakestBranch.branchName}`,
      body: `${weakestBranch.branchName} is currently the weakest completion branch at ${weakestBranch.completionRate.toFixed(1)}%. Review staffing, delays, or lane throughput there first.`,
      tone: 'warning',
    });
  }

  if (dashboard.activeLanes < dashboard.totalLanes) {
    items.push({
      title: 'Recover inactive lane capacity',
      body: `${dashboard.totalLanes - dashboard.activeLanes} lane(s) are inactive. Reopening usable lanes is the fastest way to increase throughput before adding more staff.`,
      tone: 'info',
    });
  }

  if (branchMetrics && selectedBranchName) {
    const registeredBacklog = branchMetrics.statusBreakdown.REGISTERED ?? 0;
    const popularService = Object.entries(branchMetrics.servicesBreakdown).sort((a, b) => b[1] - a[1])[0];

    if (registeredBacklog >= 3) {
      items.push({
        title: `Queue pressure at ${selectedBranchName}`,
        body: `${registeredBacklog} session(s) are still sitting in REGISTERED. Consider assigning another operator or opening another lane for faster turn-in.`,
        tone: 'warning',
      });
    } else if (popularService) {
      items.push({
        title: `${selectedBranchName} sales signal`,
        body: `${popularService[0]} is leading the service mix today. Keep materials and upsell scripts ready around that package.`,
        tone: 'success',
      });
    }
  }

  return items.slice(0, 3);
}

export function getRecommendationToneColor(tone: RecommendationTone) {
  if (tone === 'success') {
    return {
      border: 'rgba(34,197,94,0.22)',
      bg: 'rgba(34,197,94,0.09)',
      text: '#b7f7c8',
      body: 'rgba(222, 243, 230, 0.82)',
    };
  }
  if (tone === 'warning') {
    return {
      border: 'rgba(245,158,11,0.24)',
      bg: 'rgba(245,158,11,0.09)',
      text: '#f8d48b',
      body: 'rgba(245, 236, 219, 0.82)',
    };
  }
  return {
    border: 'rgba(56,189,248,0.22)',
    bg: 'rgba(56,189,248,0.09)',
    text: '#9edcf2',
    body: 'rgba(223, 238, 243, 0.82)',
  };
}

export function getSessionStageOrder(status: SessionStatus) {
  switch (status) {
    case 'REGISTERED':
      return 1;
    case 'WASHING':
      return 2;
    case 'INTERIOR':
      return 3;
    case 'INSPECTION':
      return 4;
    case 'COMPLETED':
      return 5;
    case 'EXPIRED':
      return 0;
    default:
      return 0;
  }
}
