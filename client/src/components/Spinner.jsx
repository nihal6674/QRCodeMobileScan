const COLOR_MAP = {
  brand: "#2563eb",    // blue-600
  dark: "#374151",     // gray-700
  success: "#16a34a",  // green-600
  danger: "#dc2626",   // red-600
  warning: "#f59e0b",  // amber-500
  pink: "#db2777",     // pink-600
  purple: "#7c3aed",   // purple-600
};

const Spinner = ({ size = 16, visible, variant = "brand" }) => {
  const color = COLOR_MAP[variant] || COLOR_MAP.brand;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 101"
      width={size}
      height={size}
      className={`absolute ${visible ? "opacity-100" : "opacity-0"}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring */}
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591
        C22.3858 100.591 0 78.2051 0 50.5908
        C0 22.9766 22.3858 0.59082 50 0.59082
        C77.6142 0.59082 100 22.9766 100 50.5908Z"
        fill={color}
        opacity="0.2"
      />

      {/* Rotating arc */}
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116
        97.0079 33.5539C95.2932 28.8227 92.871 24.3692
        89.8167 20.348C85.8452 15.1192 80.8826 10.7238
        75.2124 7.41289"
        fill={color}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

export default Spinner;
