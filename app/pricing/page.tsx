import { OrbPulse } from "@/components/OrbPulse";

const plans = [
  { name: "Freeminium", desc: "Get started with basics", price: "$0", cta: "Start" },
  { name: "Pro", desc: "For growing usage", price: "$19", cta: "Upgrade" },
  { name: "Expert", desc: "Advanced capabilities", price: "$49", cta: "Choose" },
  { name: "Enterprise", desc: "Scale and control", price: "Contact", cta: "Talk to us" },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="relative flex-1 max-w-6xl w-full mx-auto px-6 py-16">
        <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
          <OrbPulse />
        </div>
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div key={p.name} className="glass rounded-xl p-6 flex flex-col gap-3">
              <h2 className="text-xl font-medium">{p.name}</h2>
              <p className="text-white/70 text-sm">{p.desc}</p>
              <div className="text-2xl mt-2">{p.price}</div>
              <button className="mt-auto glass rounded-lg px-4 py-2 text-sm font-medium">
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}







