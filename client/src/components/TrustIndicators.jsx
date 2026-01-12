import { ShieldCheck, Lock, BadgeCheck } from "lucide-react";

export default function TrustIndicators() {
  return (
    <div className="mt-2 flex justify-center items-center gap-5 text-[11px] text-gray-500 tracking-wide">
      
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 trust-icon" />
        <span>Secure</span>
      </div>

      <span className="w-px h-3 bg-gray-300" />

      <div className="flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-blue-600 trust-icon" />
        <span>Encrypted</span>
      </div>

      <span className="w-px h-3 bg-gray-300" />

      <div className="flex items-center gap-1.5">
        <BadgeCheck className="w-3.5 h-3.5 text-gray-600 trust-icon" />
        <span>Trusted</span>
      </div>

    </div>
  );
}
