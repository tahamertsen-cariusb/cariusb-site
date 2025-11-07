export type PlanType = 'guest' | 'free' | 'pro';

export interface PlanLimits {
  messages_per_day: number;
  deepsearch_per_day: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  guest: { messages_per_day: 5, deepsearch_per_day: 1 },
  free: { messages_per_day: 100, deepsearch_per_day: 10 },
  pro: { messages_per_day: 2000, deepsearch_per_day: 9999 }, // effectively unlimited
};

/**
 * Get plan limits for a given plan type
 * @param plan - Plan type ('guest', 'free', 'pro')
 * @returns Plan limits object
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.guest;
}

/**
 * Check if a plan supports deepsearch (has deepsearch limit > 0)
 * @param plan - Plan type
 * @returns true if deepsearch is enabled for the plan
 */
export function planSupportsDeepsearch(plan: PlanType): boolean {
  return getPlanLimits(plan).deepsearch_per_day > 0;
}

