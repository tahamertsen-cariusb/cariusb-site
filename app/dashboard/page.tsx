"use client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UsageCard } from "@/components/dashboard/UsageCard";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { SessionsTable } from "@/components/dashboard/SessionsTable";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import DashboardGuard from "@/components/DashboardGuard";

/**
 * Dashboard Page - Layout container and composition
 * Implements: Header summary, Usage, Plan card, Sessions table, Settings form
 */
export default function DashboardPage() {
  return (
    <DashboardGuard>
      <div className="min-h-dvh" style={{ backgroundColor: "var(--color-page)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Summary */}
          <div className="mb-6">
            <DashboardHeader />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Usage Card - spans 2 columns */}
            <div className="lg:col-span-2">
              <UsageCard />
            </div>

            {/* Plan Card - spans 1 column */}
            <div className="lg:col-span-1">
              <PlanCard />
            </div>
          </div>

          {/* Bottom Grid - Sessions and Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions Table */}
            <div>
              <SessionsTable />
            </div>

            {/* Settings Form */}
            <div id="settings">
              <SettingsForm />
            </div>
          </div>
        </div>
      </div>
    </DashboardGuard>
  );
}
