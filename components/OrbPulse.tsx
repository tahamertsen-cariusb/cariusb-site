"use client";

/**
 * Cognitive Orb component
 * Subtle pulse animation with 30-40% opacity
 * GPU-friendly animation
 */
export function OrbPulse() {
  return (
    <div 
      aria-hidden 
      className="relative mx-auto h-[378px] w-[378px]"
      style={{ opacity: 0.3 }}
    >
      {/* Primary orb - subtle pulse */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl max-sm:blur-xl animate-orbPulse"
        style={{
          background: 'radial-gradient(circle at 30% 30%, var(--color-accent), transparent 60%)',
          opacity: 0.3,
        }}
      />
      
      {/* Secondary orb - subtle pulse */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl max-sm:blur-xl animate-orbPulse"
        style={{
          background: 'radial-gradient(circle at 70% 70%, var(--color-accent), transparent 60%)',
          opacity: 0.25,
          animationDelay: '1s',
        }}
      />
      
      {/* Tertiary orb - static */}
      <div 
        className="absolute inset-10 rounded-full blur-2xl max-sm:blur-xl"
        style={{
          background: 'radial-gradient(circle, var(--color-accent), transparent 60%)',
          opacity: 0.2,
        }}
      />
    </div>
  );
}
