export const COOLING_OFF_DAYS = 14;
const COOLING_OFF_MS = COOLING_OFF_DAYS * 24 * 60 * 60 * 1000;

export const CANCELLATION_REASONS = [
  { id: "too_expensive", label: "It's too expensive" },
  { id: "not_using", label: "I'm not using it enough" },
  { id: "missing_features", label: "Missing features I need" },
  { id: "found_alternative", label: "I found a better alternative" },
  { id: "technical_issues", label: "Technical issues or bugs" },
  { id: "other", label: "Other" },
] as const;

export type CancellationReasonId = (typeof CANCELLATION_REASONS)[number]["id"];

export function getBillingPeriodStart(subscription: {
  current_period_start?: string | null;
  created_at?: string | null;
}): Date {
  if (subscription.current_period_start) {
    return new Date(subscription.current_period_start);
  }
  if (subscription.created_at) {
    return new Date(subscription.created_at);
  }
  return new Date();
}

export function isWithinCoolingOffPeriod(periodStart: Date, now = Date.now()): boolean {
  return now - periodStart.getTime() < COOLING_OFF_MS;
}

export function getCoolingOffDaysRemaining(periodStart: Date, now = Date.now()): number {
  const elapsedMs = now - periodStart.getTime();
  const remainingMs = COOLING_OFF_MS - elapsedMs;
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
}
