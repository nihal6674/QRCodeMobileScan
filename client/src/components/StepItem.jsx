import Spinner from "./Spinner";

const StepItem = ({ label, done, active, color = "brand" }) => {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Spinner
          size={16}
          visible={active && !done}
          variant={color}
        />

        <svg
          viewBox="0 0 24 24"
          className={`absolute w-4 h-4 transition-all duration-200
            ${done ? "scale-100 opacity-100 text-green-600" : "scale-50 opacity-0"}
          `}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <span
        className={
          done
            ? "text-green-600 font-medium"
            : active
            ? "text-blue-600"
            : "text-gray-400"
        }
      >
        {label}
      </span>
    </div>
  );
};

export default StepItem;
