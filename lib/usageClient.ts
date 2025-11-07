/**
 * Usage client stub
 * Gets deepsearch usage and limits
 */

import { getCurrentPlan, getUsageCount } from "./utils/usage";
import { getPlanLimits } from "./planConfig";

export interface UsageData {
  deepsearch_used: number;
  deepsearch_limit: number;
  messages_used?: number;
  messages_limit?: number;
}

/**
 * Get usage data (stub)
 * Returns deepsearch usage and limits
 */
export async function getUsage(): Promise<UsageData> {
  const plan = await getCurrentPlan();
  const { deepsearchUsed, messagesUsed } = await getUsageCount();
  const limits = getPlanLimits(plan);

  return {
    deepsearch_used: deepsearchUsed,
    deepsearch_limit: limits.deepsearch_per_day,
    messages_used: messagesUsed,
    messages_limit: limits.messages_per_day,
  };
}



