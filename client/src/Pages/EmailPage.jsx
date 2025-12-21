import { useState } from "react";

export default function EmailPage({ onBack, onSubmit }) {
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [extraEmails, setExtraEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!primaryEmail) return;

    setLoading(true);

    const emails = [
      primaryEmail,
      ...extraEmails
        .split(",")
        .map(e => e.trim())
        .filter(Boolean)
    ];

    // backend call later
    setTimeout(() => {
      setLoading(false);
      onSubmit(emails);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-center mb-4">
          Send Your Form
        </h2>

        <label className="block mb-3 text-sm font-medium text-gray-700">
          Email address (required)
        </label>
        <input
          type="email"
          value={primaryEmail}
          onChange={(e) => setPrimaryEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <label className="block mb-3 text-sm font-medium text-gray-700">
          Additional email(s) (optional)
        </label>
        <input
          type="text"
          value={extraEmails}
          onChange={(e) => setExtraEmails(e.target.value)}
          placeholder="comma,separated,emails"
          className="w-full border rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-300 py-2 rounded-lg font-medium"
          >
            Back
          </button>

          <button
            disabled={!primaryEmail || loading}
            onClick={handleSubmit}
            className={`flex-1 py-2 rounded-lg font-medium text-white ${
              primaryEmail && !loading
                ? "bg-blue-600"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Sending…" : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
