
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Aegis logo">
      <svg width="28" height="32" viewBox="0 0 28 32" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E90FF"/>
            <stop offset="60%" stopColor="#00D3A7"/>
            <stop offset="100%" stopColor="#FF6A00"/>
          </linearGradient>
        </defs>
        <path d="M14 1 L26 6 V14 C26 22 20 27 14 31 C8 27 2 22 2 14 V6 Z" fill="url(#g)" />
        <path d="M14 6 L21 9 V14 C21 18 18 21 14 24 C10 21 7 18 7 14 V9 Z" fill="#0B0F14"/>
      </svg>
      <span className="font-semibold text-lg tracking-wide">Aegis</span>
    </div>
  );
}
