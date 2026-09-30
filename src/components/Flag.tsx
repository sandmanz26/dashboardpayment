export default function Flag({ size = 38 }: { size?: number }) {
  return (
    <span className="flag" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
        <defs>
          <clipPath id="fc"><circle cx="20" cy="20" r="18" /></clipPath>
        </defs>
        <circle cx="20" cy="20" r="19.5" fill="#f4f6fa" />
        <g clipPath="url(#fc)">
          <rect x="0" y="0" width="40" height="20" fill="#E8111F" />
          <rect x="0" y="20" width="40" height="20" fill="#f7f8fa" />
        </g>
      </svg>
    </span>
  );
}
