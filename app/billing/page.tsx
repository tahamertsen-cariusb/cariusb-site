'use client';
import { OrbPulse } from "@/components/OrbPulse";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";

// TODO: Future implementation - Replace Payment Links with Stripe Checkout Sessions
// TODO: Future implementation - Add webhook fulfillment for subscription management
// TODO: Future implementation - Create API route at /api/stripe/checkout to create Checkout Sessions
// TODO: Future implementation - Create API route at /api/stripe/webhook to handle subscription events

const plans = [
  {
    name: "Freemium",
    desc: "Get started with basics",
    envKey: "NEXT_PUBLIC_STRIPE_LINK_FREEMIUM",
  },
  {
    name: "Pro",
    desc: "For growing usage",
    envKey: "NEXT_PUBLIC_STRIPE_LINK_PRO",
  },
  {
    name: "Expert",
    desc: "Advanced capabilities",
    envKey: "NEXT_PUBLIC_STRIPE_LINK_EXPERT",
  },
  {
    name: "Enterprise",
    desc: "Scale and control",
    envKey: "NEXT_PUBLIC_STRIPE_LINK_ENTERPRISE",
  },
];

export default function BillingPage() {
  const email = useAuthEmail();

  function getPaymentLink(envKey: string): string | null {
    return process.env[envKey] || null;
  }

  function buildPaymentUrl(link: string | null): string | null {
    if (!link) return null;

    // Append email if user is logged in
    if (email) {
      const hasQuery = link.includes('?');
      const separator = hasQuery ? '&' : '?';
      return `${link}${separator}prefilled_email=${encodeURIComponent(email)}`;
    }

    return link;
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="relative flex-1 max-w-6xl w-full mx-auto px-6 py-16">
        <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
          <OrbPulse />
        </div>
        <h1 className="text-3xl font-semibold">Billing</h1>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const paymentLink = getPaymentLink(plan.envKey);
            const paymentUrl = buildPaymentUrl(paymentLink);
            const isDisabled = !paymentLink;

            return (
              <div
                key={plan.name}
                className="glass rounded-xl p-6 flex flex-col gap-3 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-xl font-medium">{plan.name}</h2>
                <p className="text-white/70 text-sm">{plan.desc}</p>
                <div className="mt-auto">
                  {paymentUrl ? (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block glass rounded-lg px-4 py-2 text-sm font-medium text-center transition-opacity ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed pointer-events-none'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      Get started
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full glass rounded-lg px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
                    >
                      Get started
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}




