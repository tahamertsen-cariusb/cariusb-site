"use client";
import { Check, X, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import Link from "next/link";

const mockUser = {
  plan: "free" as "guest" | "free" | "pro",
};

const planFeatures = {
  guest: [
    { label: "Basic chat", included: true },
    { label: "Limited messages", included: true },
    { label: "Deepsearch (limited)", included: false },
    { label: "Priority support", included: false },
  ],
  free: [
    { label: "Unlimited chat", included: true },
    { label: "3,000 messages/month", included: true },
    { label: "Deepsearch (limited)", included: true },
    { label: "Priority support", included: false },
  ],
  pro: [
    { label: "Priority queue", included: true },
    { label: "Higher limits", included: true },
    { label: "Deepsearch+", included: true },
    { label: "API access", included: true },
    { label: "Priority support", included: true },
  ],
};

const planBadgeColors = {
  guest: "bg-text2/20 text-text2 border-text2/30",
  free: "bg-accent/20 text-accent border-accent/30",
  pro: "bg-success/20 text-success border-success/30",
};

/**
 * PlanCard - Current plan + feature checklist + Upgrade/Manage buttons
 */
export function PlanCard() {
  const currentPlan = mockUser.plan;
  const features = planFeatures[currentPlan];
  const isPro = currentPlan === "pro";

  const handleUpgrade = () => {
    console.log("Upgrade clicked");
    // Stub: Navigate to pricing or billing
  };

  const handleManage = () => {
    console.log("Manage subscription clicked");
    // Stub: Navigate to billing management
  };

  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text1 mb-4">Plan</h2>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-lg font-semibold ${planBadgeColors[currentPlan]}`}>
          {isPro && <Crown className="w-5 h-5" aria-hidden="true" />}
          <span className="capitalize">{currentPlan}</span>
        </div>
      </div>

      {/* Feature Checklist */}
      <div className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 text-text2 flex-shrink-0" />
            )}
            <span className={`text-sm ${feature.included ? "text-text1" : "text-text2"}`}>
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {isPro ? (
          <Link href="/billing">
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              aria-label="Manage Plan"
            >
              Manage Plan
            </Button>
          </Link>
        ) : (
          <Link href="/billing">
            <Button
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              aria-label="Upgrade to Pro"
            >
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        )}
        <p className="text-xs text-text2 text-center mt-2">Billing will be available soon.</p>
      </div>
    </GlassCard>
  );
}

