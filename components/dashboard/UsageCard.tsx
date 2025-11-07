"use client";
import { Activity } from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";

const mockUsage = {
  daily: { used: 38, limit: 100 },
  monthly: { used: 620, limit: 3000 },
  deepsearch: { on: 12, off: 24, auto: 7 },
  events: [
    { type: "limit_exceeded", time: "2025-11-01 13:20" },
    { type: "stream_error", time: "2025-10-30 21:03" },
  ],
};

/**
 * UsageCard - Today/month progress bars, mini chart, deepsearch usage, events
 */
export function UsageCard() {
  const dailyPercent = (mockUsage.daily.used / mockUsage.daily.limit) * 100;
  const monthlyPercent = (mockUsage.monthly.used / mockUsage.monthly.limit) * 100;
  const dailyRemaining = mockUsage.daily.limit - mockUsage.daily.used;

  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text1 flex items-center gap-2">
          <Activity className="w-6 h-6" aria-hidden="true" />
          Usage
        </h2>
      </div>

      <div className="space-y-6">
        {/* Today Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text1">Today</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text2">
                {mockUsage.daily.used} / {mockUsage.daily.limit}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-2 text-text2 border border-stroke">
                {dailyRemaining} remaining
              </span>
            </div>
          </div>
          <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={mockUsage.daily.used} aria-valuemin={0} aria-valuemax={mockUsage.daily.limit} aria-label="Daily usage">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(dailyPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Monthly Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text1">This Month</span>
            <span className="text-sm text-text2">
              {mockUsage.monthly.used} / {mockUsage.monthly.limit}
            </span>
          </div>
          <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={mockUsage.monthly.used} aria-valuemin={0} aria-valuemax={mockUsage.monthly.limit} aria-label="Monthly usage">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Mini Chart Placeholder */}
        <div className="pt-4 border-t" style={{ borderColor: "var(--color-stroke)" }}>
          <span className="text-sm font-medium text-text1 mb-3 block">Usage Trend</span>
          <div className="h-20 bg-surface-2 rounded-lg p-3 flex items-end justify-between gap-1">
            {[65, 45, 80, 55, 70, 60, 75].map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-accent/60 rounded-t transition-all hover:bg-accent"
                style={{ height: `${height}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Deepsearch Breakdown */}
        <div className="pt-4 border-t" style={{ borderColor: "var(--color-stroke)" }}>
          <span className="text-sm font-medium text-text1 mb-3 block">Deepsearch Usage</span>
          <div className="flex items-center gap-4 text-xs text-text2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
              <span>On: {mockUsage.deepsearch.on}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-text2" aria-hidden="true" />
              <span>Off: {mockUsage.deepsearch.off}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
              <span>Auto: {mockUsage.deepsearch.auto}</span>
            </div>
          </div>
        </div>

        {/* Events List */}
        {mockUsage.events.length > 0 && (
          <div className="pt-4 border-t" style={{ borderColor: "var(--color-stroke)" }}>
            <span className="text-xs font-medium text-text2 mb-2 block">Recent Events</span>
            <div className="space-y-1">
              {mockUsage.events.slice(0, 2).map((event, idx) => (
                <div key={idx} className="text-xs text-text2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-text2/50" aria-hidden="true" />
                  <span>{event.type}</span>
                  <span className="text-text2/70">•</span>
                  <span>{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

