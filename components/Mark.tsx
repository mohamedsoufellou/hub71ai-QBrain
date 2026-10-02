export function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M10 54V28.5C10 16.1 20 8 32 8s22 8.1 22 20.5V54" fill="none" stroke="#2B6A88" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="32" cy="26" r="3.2" fill="#C9A877" />
      <path d="M20 40.5c3.4 3.6 6.8 3.6 12 0s8.4-3.6 12 0" fill="none" stroke="#C9A877" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
