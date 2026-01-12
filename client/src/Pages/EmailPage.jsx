import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import PhoneInput from "react-phone-number-input";

export default function EmailPage({ image, onBack, consentAccepted }) {
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [extraEmails, setExtraEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [phone, setPhone] = useState("");
  const [smsInfo, setSmsInfo] = useState(null);
  const [countryCode, setCountryCode] = useState("+1");
  const [sentEmails, setSentEmails] = useState([]);
  const [sentPhone, setSentPhone] = useState(null);

  const [smsConsent, setSmsConsent] = useState(false);
  const isSmsConsentRequired = Boolean(phone);
  const canSubmit =
    primaryEmail && (!isSmsConsentRequired || smsConsent) && !loading;

  const handleSubmit = async () => {
    if (!primaryEmail || !image) return;

    setLoading(true);
    setError(false);

    try {
      const emails = [
        primaryEmail,
        ...extraEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      ];

      const res = await fetch(image);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("file", blob, "scan.jpg");
      formData.append("emails", emails.join(","));

      // ✅ CONSENT LOGIC
      const consentValue = phone ? smsConsent : true;
      formData.append("consent", consentValue ? "true" : "false");

      if (phone) {
        formData.append("phone", phone);
      }

      const response = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Consent is required");
      }

      // 🔹 Store what was actually sent
      setSentEmails(emails);

      if (data.sms?.enabled) {
        setSmsInfo(data.sms);
        setSentPhone(phone);
      } else {
        setSentPhone(null);
      }

      setSuccess(true);
      setSmsConsent(false);

      navigator.vibrate?.(50);
    } catch (err) {
      console.error(err);
      setError(true);
      navigator.vibrate?.([50, 50, 50]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // SUCCESS SCREEN
  // ----------------------------
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Progressive Tick */}
          <div className="mb-6 flex justify-center animate-[scale_0.9_to_1]">
            <svg className="w-24 h-24" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeDasharray="157"
                strokeDashoffset="157"
                className="animate-circle"
              />
              <path
                fill="none"
                stroke="#22c55e"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27l7 7 17-17"
                strokeDasharray="48"
                strokeDashoffset="48"
                className="animate-tick"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Sent Successfully
          </h2>

          {/* Delivery summary */}
          <div className="mt-4 mb-6 space-y-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Delivered via
            </div>

            <div className="space-y-2">
              {sentEmails.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>Email</span>
                  </div>
                  <span className="text-xs text-gray-500 text-right">
                    {sentEmails.length === 1
                      ? sentEmails[0]
                      : `${sentEmails[0]} +${sentEmails.length - 1} more`}
                  </span>
                </div>
              )}

              {sentPhone && (
                <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>SMS</span>
                  </div>
                  <span className="text-xs text-gray-500">{sentPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Spam / Promotions notice */}
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 items-start text-left">
            <div className="mt-0.5 text-amber-500 text-sm">⚠️</div>
            <p className="text-xs text-amber-700 leading-relaxed">
              If you don’t see the email in your inbox, please check your
              <span className="font-semibold"> Junk or Spam</span> folder.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------
  // FAILURE SCREEN
  // ----------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Progressive Error Icon */}
          <div className="mb-6 flex justify-center animate-[scale_0.9_to_1]">
            <svg className="w-24 h-24" viewBox="0 0 52 52">
              {/* Circle */}
              <circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="157"
                strokeDashoffset="157"
                className="animate-circle"
              />

              {/* Cross */}
              <path
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeLinecap="round"
                d="M16 16l20 20M36 16l-20 20"
                strokeDasharray="56"
                strokeDashoffset="56"
                className="animate-cross"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Delivery Failed
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            We couldn’t send your document. Please try again.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setError(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 transition py-3 rounded-xl font-semibold"
            >
              Retry
            </button>

            <button
              onClick={onBack}
              className="flex-1 bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------
  // MAIN EMAIL UI
  // ----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-center">Send Document</h2>
          <p className="text-xs text-green-500 text-center mt-1">
            ✓ Processing complete — ready to send
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Primary Email <span className="text-red-500">*</span>
            </label>
            <input
  type="email"
  readOnly
  onFocus={(e) => e.target.removeAttribute("readOnly")}
  onBlur={(e) => e.target.setAttribute("readOnly", true)}
  placeholder="name@example.com"
  value={primaryEmail}
  onChange={(e) => setPrimaryEmail(e.target.value)}
  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Additional Emails (optional)
            </label>
            <input
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={extraEmails}
              onChange={(e) => setExtraEmails(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mobile Number (optional – secure SMS link)
            </label>

            <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={setPhone}
              className="PhoneInput"
            />

            <p className="text-[11px] text-gray-400 mt-1">
              We’ll send a secure SMS download link to this number
            </p>
            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                className="mt-1"
              />
              <p className="text-[11px] text-gray-600 leading-snug">
                I agree to receive a <b>one-time SMS</b> with a secure download
                link. Message & data rates may apply. Reply STOP to opt out.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 transition py-2.5 rounded-xl font-medium disabled:opacity-50"
            >
              Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition active:scale-[0.98] ${
                canSubmit
                  ? "bg-blue-600 hover:bg-blue-700 shadow"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Send
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            🔒 Secure delivery via encrypted connection
          </p>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="w-14 h-14 mx-auto rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />

              <p className="text-sm font-medium text-gray-700">
                Sending document…
              </p>

              <p className="text-xs text-gray-500 mt-1">
                This usually takes about{" "}
                <span className="font-medium">2–3 seconds</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
