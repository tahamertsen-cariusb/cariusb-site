"use client";
import { User, MessageSquare, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";

const mockUser = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: "",
  plan: "free" as "guest" | "free" | "pro",
  renewalAt: "2026-01-15",
};

/**
 * Dashboard Header - User info, plan badge, quick actions
 * Left: avatar, name, email
 * Right: Plan badge, [Go to Chat], [Upgrade/Manage]
 */
export function DashboardHeader() {
  const planLabels = {
    guest: "Guest",
    free: "Free",
    pro: "Pro",
  };

  const planBadgeColors = {
    guest: "bg-text2/20 text-text2 border-text2/30",
    free: "bg-accent/20 text-accent border-accent/30",
    pro: "bg-success/20 text-success border-success/30",
  };

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: User Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            {mockUser.avatarUrl ? (
              <img src={mockUser.avatarUrl} alt={mockUser.name} className="w-12 h-12 rounded-full" />
            ) : (
              <User className="w-6 h-6 text-accent" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text1">{mockUser.name}</h1>
            <p className="text-sm text-text2">{mockUser.email}</p>
          </div>
        </div>

        {/* Right: Plan Badge + Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Plan Badge */}
          <div className="flex flex-col gap-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${planBadgeColors[mockUser.plan]}`}>
              <span>{planLabels[mockUser.plan]}</span>
            </div>
            {mockUser.plan === "pro" && mockUser.renewalAt && (
              <p className="text-xs text-text2">Renews on {mockUser.renewalAt}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/chat">
              <Button
                variant="default"
                size="md"
                className="flex items-center gap-2"
                aria-label="Go to Chat"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>Go to Chat</span>
              </Button>
            </Link>
            <Link href="/billing">
              <Button
                variant="outline"
                size="md"
                className="flex items-center gap-2"
                aria-label={mockUser.plan === "pro" ? "Manage Plan" : "Upgrade to Pro"}
              >
                <CreditCard className="w-4 h-4" aria-hidden="true" />
                <span>{mockUser.plan === "pro" ? "Manage" : "Upgrade"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

