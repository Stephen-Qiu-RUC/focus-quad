export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="9" height="9" rx="2.6" fill="var(--q1)" />
      <rect x="13" y="2" width="9" height="9" rx="2.6" fill="var(--q2)" />
      <rect x="2" y="13" width="9" height="9" rx="2.6" fill="var(--q3)" />
      <rect x="13" y="13" width="9" height="9" rx="2.6" fill="var(--q4)" />
    </svg>
  );
}
