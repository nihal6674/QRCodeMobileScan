import { useState } from "react";
import { useParams } from "react-router-dom";
import logo from "../assets/logo.png";


const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function DownloadPage() {
  const { token } = useParams();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDownload = async () => {
    if (!pin) return;

    setLoading(true);
    setError("");
    setReadyToDownload(false);

    try {
      const res = await fetch(`${API_BASE}/api/download/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin }),
      });

      if (!res.ok) {
        const msg = await res.json();

        setPin(""); // clear PIN
        navigator.vibrate?.(30); // haptic feedback

        throw new Error(msg.detail || "Invalid PIN");
      }


      // ✅ PIN verified
      setReadyToDownload(true);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Small delay so user sees the message
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = url;
        a.download = "LiveScanForm.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
      }, 600);
    } catch (err) {
      setError(err.message);

      // 🔔 trigger shake
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6 text-center">
        <div className="mb-4 flex justify-center">
          <img
            src={logo}
            alt="The Loss Prevention Group"
            className="h-12 object-contain"
          />
        </div>
        <div className="my-3 h-px bg-gray-200" />

        <h2 className="text-lg font-semibold mb-2">Secure Document Download</h2>

        <p className="text-sm text-gray-500 mb-4">
          Enter the PIN sent to your phone to download the document.
        </p>

        <input
          type="password"
          inputMode="numeric"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 mb-4 text-center tracking-widest
    ${shake ? "animate-shake border-red-500" : ""}
  `}
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handleDownload}
          disabled={loading || !pin}
          className={`w-full py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${
            loading || !pin
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? "Verifying…" : "Download"}
        </button>

        {readyToDownload && !error && (
          <p className="text-sm text-green-600 mt-4">
            Your download is about to start…
          </p>
        )}

        <p className="text-[11px] text-gray-400 mt-4">
          This link is single-use and expires automatically.
        </p>
      </div>
    </div>
  );
}
