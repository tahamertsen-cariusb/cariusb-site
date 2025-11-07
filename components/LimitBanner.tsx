"use client";
import Link from "next/link";
import type { PlanType } from "@/lib/planConfig";

interface LimitBannerProps {
  plan: PlanType;
  limitType?: 'messages' | 'deepsearch';
  className?: string;
}

export function LimitBanner({ plan, limitType = 'messages', className = "" }: LimitBannerProps) {
  if (limitType === 'deepsearch') {
    return (
      <div
        className={`rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4 text-sm text-center ${className}`}
      >
        🔍 Deepsearch hakkın tükendi.{" "}
        {plan === 'guest' ? (
          <>
            <Link href="/auth/register" className="underline hover:text-white/80 transition-colors">
              Ücretsiz üye ol
            </Link>
            {" "}ve 10 deepsearch hakkına kadar devam et!
          </>
        ) : (
          <>
            <Link href="/billing" className="underline hover:text-white/80 transition-colors">
              Pro plana geç
            </Link>
            {" "}ve sınırsız deepsearch kullan!
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4 text-sm text-center ${className}`}
    >
      {plan === 'guest' ? (
        <>
          💬 Günlük mesaj hakkın doldu.{" "}
          <Link href="/auth/register" className="underline hover:text-white/80 transition-colors">
            Ücretsiz üye ol
          </Link>{" "}
          ve 100 mesaja kadar devam et!
        </>
      ) : (
        <>
          💬 Ücretsiz plan hakkın doldu.{" "}
          <Link href="/billing" className="underline hover:text-white/80 transition-colors">
            Pro plana geç
          </Link>
          .
        </>
      )}
    </div>
  );
}

